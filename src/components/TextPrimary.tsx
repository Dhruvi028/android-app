import React from 'react';
import { Text } from 'react-native';

const TextPrimary = ({ className, ...props }: any) => {
    return (
        <Text
            className={`${className} text-[#132541] font-serif`}
            {...props}
        />
    );
};

export default TextPrimary;