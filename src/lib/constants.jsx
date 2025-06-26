export const COLORS = {
  primary: '#37AFE1',
  secondary: '#FF6347',
  background: '#FFFFFF',
  backgroundSecondary: '#00000050',
  textLight: '#FFFFFF',
  textDark: '#000000',
  textDarkShadow: '#00000070',
  error: '#FF6347',
  success: '#32CD32',
  warning: '#FFA500',
  // Add other colors here
};

export const FONT_SIZES = {
  smallXL: 12,
  small: 14,
  medium: 16,
  large: 20,
  // Add other font sizes here
};

export const SPACING = {
  smallXL: 2,
  small: 5,
  medium: 13,
  large: 20,
  // Add other spacing values here
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  // Add other border radius values here
};

export const SHADOW_CARD = {
  small: 4,
  medium: 8,
  large: 12,
  // Add other border radius values here
};

export const FONT_FAMILIES = {
  regular: 'Montserrat-Regular',
  // Add other font families here
};

export const FONT_STYLES = {
  fontprimary: 'Montserrat-Regular',
};

export const COMPONENT_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
  },
  textSmallXL:{
    fontSize: FONT_SIZES.smallXL,
    fontFamily: FONT_FAMILIES.regular
  },
  textSmall:{
    fontSize: FONT_SIZES.small,
    fontFamily: FONT_FAMILIES.regular
  },
  textMedium:{
    fontSize: FONT_SIZES.medium,
    fontFamily: FONT_FAMILIES.regular
  },
  textLarge:{
    fontSize: FONT_SIZES.large,
    fontFamily: FONT_FAMILIES.regular,
    color: COLORS.textDark,
  },
  spacer: {
    margin: SPACING.small,
  },
  spacerSmall: {
    margin: SPACING.smallXL,
  },
};

export const formatRupiah = (angka) => {
  if (typeof angka !== 'number') {
    angka = parseInt(angka);
  }
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};