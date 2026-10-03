import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../../shared/services/authSlice.js';
import { clearGuestCartStorage, setCartItems, setCartOwner } from '../../features/cart/cartSlice.js';
import { clearGuestFavoritesStorage, setFavorites, setFavoritesOwner } from '../../features/favorites/favoritesSlice.js';
import { userDataService } from '../../shared/services/userDataService.js';

const getCartIdentity = (item) => item.cartKey || `${item.id}__${item.selectedSize || ''}`;

const mergeCartItems = (localItems, remoteItems) => {
  const map = new Map();
  [...remoteItems, ...localItems].forEach((item) => {
    const key = getCartIdentity(item);
    const previous = map.get(key);
    const next = { ...item, cartKey: key };
    map.set(key, previous ? { ...previous, ...next, quantity: Math.max(previous.quantity || 1, next.quantity || 1) } : next);
  });
  return Array.from(map.values());
};

const mergeFavorites = (localItems, remoteItems) => {
  const map = new Map();
  [...remoteItems, ...localItems].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const favorites = useSelector((state) => state.favorites.favorites);
  const { user, authReady } = useSelector((state) => state.auth);
  const hydratedUid = useRef(null);
  const cartItemsRef = useRef(cartItems);
  const favoritesRef = useRef(favorites);
  const cartSyncTimer = useRef(null);
  const favSyncTimer = useRef(null);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (!authReady) return undefined;
    if (!user?.uid) {
      clearTimeout(cartSyncTimer.current);
      clearTimeout(favSyncTimer.current);
      hydratedUid.current = null;
      dispatch(setCartOwner(null));
      dispatch(setFavoritesOwner(null));
      return undefined;
    }
    if (hydratedUid.current === user.uid) return undefined;

    let cancelled = false;
    const localCart = cartItemsRef.current;
    const localFavorites = favoritesRef.current;

    void (async () => {
      try {
        const [remoteCart, remoteFavorites] = await Promise.all([
          userDataService.getUserCollection('cart'),
          userDataService.getUserCollection('favorites'),
        ]);
        if (cancelled) return;

        const mergedCart = mergeCartItems(localCart, remoteCart);
        const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites);
        dispatch(setCartOwner(user.uid));
        dispatch(setFavoritesOwner(user.uid));
        hydratedUid.current = user.uid;
        dispatch(setCartItems(mergedCart));
        dispatch(setFavorites(mergedFavorites));
        dispatch(clearGuestCartStorage());
        dispatch(clearGuestFavoritesStorage());

        await Promise.all([
          userDataService.saveUserCollection('cart', user.uid, mergedCart),
          userDataService.saveUserCollection('favorites', user.uid, mergedFavorites),
        ]);
      } catch (error) {
        console.error('Failed to sync user data:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, dispatch, user?.uid]);

  useEffect(() => {
    if (!user?.uid || hydratedUid.current !== user.uid) return undefined;
    clearTimeout(cartSyncTimer.current);
    cartSyncTimer.current = setTimeout(() => {
      userDataService.saveUserCollection('cart', user.uid, cartItems).catch((error) => console.error('Failed to save cart:', error));
    }, 500);
    return () => clearTimeout(cartSyncTimer.current);
  }, [cartItems, user?.uid]);

  useEffect(() => {
    if (!user?.uid || hydratedUid.current !== user.uid) return undefined;
    clearTimeout(favSyncTimer.current);
    favSyncTimer.current = setTimeout(() => {
      userDataService.saveUserCollection('favorites', user.uid, favorites).catch((error) => console.error('Failed to save favorites:', error));
    }, 500);
    return () => clearTimeout(favSyncTimer.current);
  }, [favorites, user?.uid]);

  return children;
};
