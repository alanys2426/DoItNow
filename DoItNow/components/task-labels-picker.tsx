
/*
    Backtick(`)
        + To create strings that can contain variables and expressions
        + EX: `Hello ${name}`
    ${}
        + PUrpose: Insert a JS value/expression into a template string
    Curly Braces ({})
        + Run JS inside JSX
    accessibilityElemeentsHidden
        + React Native accessibility prop
        + Hide this element and all its children from screen readers
        + Visible on screen but ignored by screen readers
    important For Accessibility
        + React Native accessibility prop
        + Declare the element's importance for accessibility
*/

// Import Material Design icons
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Import React Native components
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Import app-specific types and helper functions
import type { AppTheme } from '@/constants/theme';
import { FieldLabel } from '@/components/ui/field-label';
import {
    TASK_LABELS,
    type TaskLabel,
    taskLabelDisplay,
    taskLabelIcon
} from '@/utils/taskModel';

// Define the props this component expects
type Props = {
    theme: AppTheme;

    // Currently selected labels
    selected: TaskLabel[]

    // Function to toggle a label on/off
    onToggle: (label: TaskLabel) => void;
};

// Component for selecting task labels
export function TaskLabelsPicker({ theme, selected, onToggle }: Props) {
    return (
        <View style={styles.wrap}>
            {/* Section title */}
            <FieldLabel theme={theme}>Labels</FieldLabel>

            {/* Container holding all label options */}
            <View style={styles.row}>
                {TASK_LABELS.map((lb) => {
                    const isOn = selected.includes(lb);

                    return (
                        <Pressable
                            key={lb}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isOn }}
                            accessibilityLabel={`${taskLabelDisplay(lb)}${isOn ? ', selected' : ''}`}
                            
                            // Toggle this label when pressed
                            onPress={() => onToggle(lb)}

                            // Slightly fade while being pressed
                            style={({ pressed }) => [
                                styles.chip,
                                pressed && { opacity: 0.82 }
                            ]}>
                            
                            {/* Checkbox icon */}
                            <MaterialIcons
                                name={isOn ? 'check-box' : 'check-box-outline-blank'}
                                size={22}
                                color={isOn ? theme.colors.accent : theme.colors.textMuted}
                            />

                            {/* Label icon (work, school, home, etc.) */}
                            <MaterialIcons
                                name={taskLabelIcon(lb)}
                                size={18}
                                color={theme.colors.text}

                                // Hide this icon from screen readers
                                accessibilityElementsHidden
                                importantForAccessibility="no"
                            />

                            {/* Label text */}
                            <Text
                                style={[
                                    styles.chipText,
                                    {
                                        color: theme.colors.text,
                                        fontFamily: theme.fonts.body,
                                        fontWeight: isOn ? '700' : '500',
                                    },
                                ]}>
                                {taskLabelDisplay(lb)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

// Component styles
const styles = StyleSheet.create({
    // Outer container
    wrap: {
        gap: 7,
    },

    // Holds all label chips
    row: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },

    // Individual label option
    chip: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        paddingVertical: 2,
    },

    // Label text
    chipText: {
        fontSize: 14,
    },
});
