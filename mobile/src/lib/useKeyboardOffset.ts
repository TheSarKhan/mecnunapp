import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Height of the on-screen keyboard, or 0 when it is closed.
 *
 * Used instead of KeyboardAvoidingView: nesting that inside a SafeAreaView which already applies
 * the bottom inset counts the offset twice, which is how the chat composer ended up hidden
 * underneath the keyboard. Measuring directly leaves nothing to interpretation.
 *
 * Returns 0 on Android on purpose — the window is resized there
 * (softwareKeyboardLayoutMode "resize"), so applying an offset would shift the layout twice.
 */
export function useKeyboardOffset(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    // "Will" events fire with the animation, so content travels with the keyboard rather than
    // snapping into place once it has finished moving.
    const show = Keyboard.addListener('keyboardWillChangeFrame', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardWillHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
