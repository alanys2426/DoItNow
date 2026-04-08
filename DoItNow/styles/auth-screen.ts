
import { StyleSheet } from 'react-native';

export const authScreenStyles = StyleSheet.create({
    page: {
        flex: 1,
    },
    pageContent: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
        padding: 18,
    },
    cardWrap: {
        width: '100%',
        maxWidth: 520,
    },
    formWrap: {
        gap: 14,
        paddingHorizontal: 6,
    },
    brandWrap: {
        alignItems: 'center',
        width: '100%',
    },
    inputGroup: {
        gap: 10,
        marginTop: 6,
    },
    headingLogin: {
        fontSize: 30,
        fontWeight: '800',
        marginTop: 4,
    },
    headingSignUp: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 4,
    },
    errorText: {
        fontSize: 13
    },
    authPrimaryWrap: {
        alignSelf: 'center',
        marginTop: 4,
        maxWidth: 400,
        width: '100%',
    },
    authPrimaryBtn: {
        borderRadius: 20,
        minHeight: 56,
        paddingVertical: 4,
    },
    authLinks: {
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 18,
        paddingHorizontal: 4,
    },
    authMuted: {
        fontSize: 15,
    },
    authLinkAccent: {
        fontSize: 15,
        fontWeight: '700',
    },
    guestLinkDisabled: {
        opacity: 0.45
    },
    guestLink: {
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 14,
        paddingVertical: 6,
    },
});
