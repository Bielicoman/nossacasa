import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const hapticImpact = async (style = ImpactStyle.Medium) => {
  try {
    await Haptics.impact({ style });
  } catch (e) {
    // Ignore if not on native or haptics not available
  }
};

export const hapticSuccess = async () => {
  try {
    await Haptics.notification({ type: 'SUCCESS' });
  } catch (e) {}
};

export const hapticWarning = async () => {
  try {
    await Haptics.notification({ type: 'WARNING' });
  } catch (e) {}
};
