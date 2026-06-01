import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthReady, setUser } from '../../shared/services/authSlice.js';
import { setCartItems } from '../../features/cart/cartSlice.js';
import { setFavorites } from '../../features/favorites/favoritesSlice.js';
import { mapFirebaseUser } from '../../entities/user/model.js';
import { auth, isFirebaseEnabled } from '../../shared/services/firebase.js';
import { userDataService } from '../../shared/services/userDataService.js';

const mergeById = (localItems, remoteItems) => {
  const map = new Map();
  [...remoteItems, ...localItems].forEach((item) => {
    const previous = map.get(item.id);
    map.set(item.id, previous ? { ...previous, ...item, quantity: Math.max(previous.quantity || 1, item.quantity || 1) } : item);
  });
  return Array.from(map.values());
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites.favorites);
  const user = useSelector((state) => state.auth.user);
  const hydratedUid = useRef(null);
  const cartItemsRef = useRef(cartItems);
  const favoritesRef = useRef(favorites);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      dispatch(setAuthReady(true));
      return undefined;
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      const activeUser = auth.currentUser ?? firebaseUser;

      if (!activeUser) {
        dispatch(setUser(null));
        dispatch(setAuthReady(true));
        hydratedUid.current = null;
        return;
      }

      const mappedUser = mapFirebaseUser(activeUser);
      dispatch(setUser(mappedUser));
      dispatch(setAuthReady(true));

      const uid = activeUser.uid;

      void (async () => {
        try {
          if (!mappedUser.displayName || !mappedUser.photoURL) {
            const profile = await userDataService.getUserProfile(uid);
            if (profile?.displayName || profile?.photoURL) {
              dispatch(
                setUser({
                  ...mappedUser,
                  displayName: mappedUser.displayName || profile.displayName || '',
                  photoURL: mappedUser.photoURL || profile.photoURL || '',
                }),
              );
            }
          }

          await userDataService.upsertUser(activeUser);

          const [remoteCart, remoteFavorites] = await Promise.all([
            userDataService.getUserCollection('cart', uid),
            userDataService.getUserCollection('favorites', uid),
          ]);
          const mergedCart = mergeById(cartItemsRef.current, remoteCart);
          const mergedFavorites = mergeById(favoritesRef.current, remoteFavorites);
          hydratedUid.current = uid;
          dispatch(setCartItems(mergedCart));
          dispatch(setFavorites(mergedFavorites));

          if (mergedCart.length || mergedFavorites.length) {
            await Promise.all([
              userDataService.saveUserCollection('cart', uid, mergedCart),
              userDataService.saveUserCollection('favorites', uid, mergedFavorites),
            ]);
          }
        } catch (error) {
          console.error(error);
        }
      })();
    });
  }, [dispatch]);

  useEffect(() => {
    if (!user?.uid || hydratedUid.current !== user.uid) return;
    userDataService.saveUserCollection('cart', user.uid, cartItems);
  }, [cartItems, user?.uid]);

  useEffect(() => {
    if (!user?.uid || hydratedUid.current !== user.uid) return;
    userDataService.saveUserCollection('favorites', user.uid, favorites);
  }, [favorites, user?.uid]);

  window.updateSneakerTownProfile = async ({ displayName, photoURL }) => {
    if (!auth?.currentUser) return;
    await updateProfile(auth.currentUser, { displayName, photoURL });
    dispatch(setUser(mapFirebaseUser(auth.currentUser)));
    await userDataService.upsertUser(auth.currentUser);
  };

  return children;
};
