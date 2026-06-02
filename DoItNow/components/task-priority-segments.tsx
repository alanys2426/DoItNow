/*
    onChange
        + A function passed into this component from its parent
    accessibilityLabel
        + A description for screen readers
    accessibilityRole
        + Tells assistive technology what this element is
    accessibilityState
        + Provides state information for assistive technology
    pressed
        + A boolean that indicates whetehr the button is currently pressed
*/

// Import Material Icons for the checkmark icon
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Import React Native components and utilities
import { Platform, Pressable, StyleSheet, Text, View} from 'react-native';

// Import app-specific types and components
import type { AppTheme } from '@/constants/theme';
import { FieldLabel } from '@/components/ui/field-label';
import { parseTaskPriorityInput } from '@/utils/taskModel';

// Define the props this component expects
type Props = {
    theme: AppTheme;
    value: string;
    onChange: (next: string) => void;
    showError: boolean;
};

// Component for selecting a task priority
export function TaskPrioritySegments ({ theme, value, onChange, showError }: Props) {
    // Check if the current priority value is valid
    const valid = parseTaskPriorityInput(value) != null

    // Select a priority, or clear it if already selected
    const setOrToggle = (next: string) => {
        onChange(value === next ? '' : next);
    };

    return (
        <View style={styles.wrap}>
            {/* Label above the priority buttons */}
            <FieldLabel
                theme={theme}
                error={showError}
                suffix={

                    // Show a checkmark if a valid priority is selected
                    valid ? (
                        <MaterialIcons
                            name="check"
                            size={18}
                            color={theme.colors.accent}
                            accessibilityLabel="Priority set"
                        />
                    ) : null
                }>
                Priority
            </FieldLabel>

            {/* Container holding all priority buttons */}
            <View
                style={[
                    styles.row,
                    {
                        // Show a stronger border if there is an error
                        borderColor: showError ? theme.colors.danger : theme.colors.border,
                        borderWidth: showError ? 1.8 : 1,
                    },
                ]}>

                {/* Create buttons for priorities 1-4 */}
                {([1, 2, 3, 4] as const).map((n) => {
                    const key = String(n);

                    // Check if this button is currently selected
                    const selected = value === key;

                    return (
                        <Pressable
                            key={key}
                            accessibilityLabel={`Priority $(n)`}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}

                            // Select or unselect this priority
                            onPress={() => setOrToggle(key)}

                            // Change appearance based on select/pressed state
                            style={({ pressed }) => [
                                styles.cell,
                                styles.cellDivider,
                                {
                                    borderRightColor: theme.colors.border,
                                    backgroundColor: selected
                                        ? theme.dark
                                            ? 'rgba(242, 242, 242, 0.18)'
                                            : 'rgba(46, 40, 42, 0.1)'
                                        : pressed
                                            ? theme.colors.surfaceAlt
                                            : theme.dark
                                                ? 'rgba(242, 242, 242, 0.06)'
                                                : 'rgba(46, 40, 42, 0.04)'
                                },
                                
                            ]}>

                            {/* Display the priority number */}
                            <Text
                                style={[
                                    styles.cellText,
                                    {
                                        color: theme.colors.text,
                                        fontFamily: theme.fonts.body,

                                        // Make the text bolder when selected
                                        fontWeight: selected ? '700' : '600',
                                    },
                                ]}>
                                {n}
                            </Text>
                        </Pressable>
                    );
                })}

                {/* Priority highest button */}
                <Pressable
                    accessibilityLabel="Priority highest"
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === '!' }}

                    // Select or unselect this priority
                    onPress={() => setOrToggle('!')}

                    // Change appearance based on selected/pressed state
                    style={({ pressed }) => [
                        styles.cell,
                        {
                            backgroundColor:
                                value === '!'
                                    ? theme.dark
                                        ? 'rgba(242, 242, 242, 0.18)'
                                        : 'rgba(46, 40, 42, 0.1)'
                                    : pressed
                                        ? theme.colors.surfaceAlt
                                        : theme.dark
                                            ? 'rgba(242, 242, 242, 0.06)'
                                            : 'rgba(46, 40, 42, 0.04)'

                        },
                    ]}>

                    {/* Display the priority symbol */}
                    <Text
                        style={[
                            styles.cellText,
                            {
                                color: theme.colors.text,
                                fontFamily: theme.fonts.body,

                                // Make selected priority bold
                                fontWeight: value === '!' ? '700' : '800',
                            },
                        ]}>
                        !
                    </Text>
                </Pressable>
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

    // Row containing all priority buttons
    row: {
        alignItems: 'stretch',
        borderRadius: 12,
        flexDirection: 'row',
        minHeight: 40,
        overflow: 'hidden',
    },

    // Shared button styling
    cell: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        minHeight: 40,
        minWidth: 0,
        paddingVertical: 10,
    },

    // Divider line between buttons
    cellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
    },

    // Text inside buttons
    cellText: {
        fontSize: Platform.OS === 'web' ? 16: 15,
        letterSpacing: 0.2
    }
})