import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function App() {
    const { isSignedIn } = useAuth();

    if (isSignedIn) {
        return <Redirect href={"/(tabs)/home" as any} />;
    }

    return <Redirect href={"/(auth)/welcome" as any} />;
}