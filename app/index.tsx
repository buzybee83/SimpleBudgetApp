import { getAll, initDatabase } from '@/services/DatabaseService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Startup() {
    const router = useRouter();
    console.log('STARTUP')
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase(); // ✅ MUST happen first
                const settings = await getAll('settings'); 
                console.log('SETTINGS ')
                if (settings.length === 0) {
                    router.replace('/intro');
                } else {
                    router.replace('/(tabs)');
                }
            } catch (error) {
                console.error('Startup error:', error);
            }
        };

        setup();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
