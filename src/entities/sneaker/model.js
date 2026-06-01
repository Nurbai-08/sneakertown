export const sneakerModel = {
  isAvailable: (sneaker) => Number(sneaker?.retailPrice || 0) > 0,
};
