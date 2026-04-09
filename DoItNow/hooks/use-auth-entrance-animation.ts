
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Custom hook that controls login screen entrance animations
export function useAuthEntranceAnimation() {
    // Logo starts slightly lower (24px down)
    const logoTranslateY = useRef(new Animated.Value(24)).current;

    // Logo start slightly bigger (scale 1.03)
    const logoScale = useRef(new Animated.Value(1.03)).current;

    // Form starts invisible
    const formOpacity = useRef(new Animated.Value(0)).current;

    // Form starts lower on screen (42px down)
    const formTranslateY = useRef(new Animated.Value(42)).current;

    useEffect(() => {

        // Run all animations together
        Animated.parallel([

            //Animate logo movement + scaling at the same time
            Animated.parallel([
                Animated.timing(logoTranslateY, {
                    toValue: -18, // move logo up
                    duration: 620,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver:true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1, // return to normal size
                    duration: 620,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),

            // Animate form after a small delay
            Animated.sequence([
                Animated.delay(180), // wait before showing form
                Animated.parallel([
                    // fade in form
                    Animated.timing(formOpacity, {
                        toValue: 1,
                        duration: 340,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),

                    // slide form up into place
                    Animated.timing(formTranslateY, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start(); // start all animations
    }, [formOpacity, formTranslateY, logoScale, logoTranslateY]);

    // Return animation values so UI components can use them
    return { logoTranslateY, logoScale, formOpacity, formTranslateY };
}
