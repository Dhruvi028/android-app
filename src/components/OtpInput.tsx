import React, { useState, useRef } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

const OtpInput = ({ length = 4, onChangeOtp, otp, inputRefs }: any) => {

    const handleInputChange = (text: any, index: any) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        onChangeOtp(newOtp);

        if (text.length === 1 && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (event: any, index: any) => {
        if (event.nativeEvent.key === 'Backspace' && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            onChangeOtp(newOtp);
        }
        if (event.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <View className="flex items-center flex-row justify-center gap-4 ">
            {otp.map((_: any, index: number) => (
                <TextInput
                    key={index}
                    className={`w-20 h-20 border-2 border-gray-400 text-center text-5xl placeholder:text-slate-400 rounded-xl
                        focus:border-blue-400
                        `}
                    keyboardType="number-pad"
                    placeholder="x"
                    maxLength={1}
                    value={otp[index]}
                    onChangeText={(text: any) => handleInputChange(text, index)}
                    onKeyPress={(event: any) => handleKeyPress(event, index)}
                    ref={(ref: any) => (inputRefs.current[index] = ref)}
                    style={[{ fontFamily: 'Itim-Regular' }]}
                />
            ))}
        </View>
    );
};

export default OtpInput;
