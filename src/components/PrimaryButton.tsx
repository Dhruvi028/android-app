import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

const PrimaryButton: React.FC<ButtonProps> = ({
    title,
    onPress = () => { },
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon = "",
    className = '',
}) => {
    let baseClasses = 'flex flex-row items-center justify-center rounded-2xl p-4';

    const variantClasses = {
        primary: 'bg-blue-600 active:bg-blue-700',
        secondary: 'bg-gray-200 active:bg-gray-300',
        outline: 'bg-transparent border border-blue-600',
    };

    const textClasses = {
        primary: 'text-white font-semibold',
        secondary: 'text-gray-800 font-semibold',
        outline: 'text-blue-600 font-semibold',
    };

    const disabledClasses = disabled ? 'opacity-50' : '';

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`;
    const textClassesString = `${textClasses[variant]} text-center text-xl`;

    return (
        <TouchableOpacity
            className={buttonClasses}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'outline' ? '#2563EB' : '#FFFFFF'} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={textClassesString}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default PrimaryButton;