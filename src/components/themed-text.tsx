import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
    style,
    type = 'default',
    ...rest
}: ThemedTextProps) {
    return (
        <Text
            style={[
                { color: '#11181C' },
                type === 'default' ? { fontSize: 16, lineHeight: 24 } : undefined,
                type === 'defaultSemiBold' ? { fontSize: 16, lineHeight: 24, fontWeight: '600' } : undefined,
                type === 'title' ? { fontSize: 32, fontWeight: 'bold', lineHeight: 32 } : undefined,
                type === 'subtitle' ? { fontSize: 20, fontWeight: 'bold' } : undefined,
                type === 'link' ? { lineHeight: 30, fontSize: 16, color: '#0a7ea4' } : undefined,
                style,
            ]}
            {...rest}
        />
    );
}
