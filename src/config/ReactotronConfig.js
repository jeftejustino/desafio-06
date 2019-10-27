import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  const tron = Reactotron.configure({ host: '192.168.11.9' })
    .useReactNative()
    .connect();

  console.tron = tron;
}
