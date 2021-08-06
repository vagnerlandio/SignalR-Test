import React, {useEffect, useState} from 'react';
import {
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import * as SignalR from '@microsoft/signalr';
import {HubConnection} from '@microsoft/signalr';
import {MessageInput} from '../../components/message-input.component';
import {Message} from '../../components/message.component';
import {StackList} from '../../infrastructure/app.navigation';

type ChatScreenRouteProp = RouteProp<StackList, 'Chat'>;

type Props = {
  route: ChatScreenRouteProp;
};

export type IMessage = {
  username: string;
  message: string;
};

export const ChatScreen = ({route}: Props) => {
  const [connection, setConnection] = useState<HubConnection>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isConnected, setConnected] = useState<boolean>(false);
  const {name} = route.params;

  const startConnection = async () => {
    try {

      const hub = new SignalR.HubConnectionBuilder()
        .withUrl('https://stage.metanetcrm.com.br/customerhub', {
          withCredentials: false,
        })
        .configureLogging(SignalR.LogLevel.Debug)
        .build();

      setConnected(true);

      hub.on('PurchaseCreated', data => {
        console.log('🚀 ~ hub.on ~ data', data);
        setMessages(m => [
          ...m,
          {username: name, message: JSON.stringify(data)},
        ]);
      });

      hub.onclose(e => {
        setMessages([]);
      });

      await hub.start();
      await hub.invoke('Join', name).catch(err => {
        console.log('🚀 ~ invoke ~ error', err);
      });
      setConnection(hub);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    startConnection();    
  }, []);

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <StatusBar />

      <View style={styles.chatContainer}>
        <FlatList
          inverted
          data={messages}
          renderItem={({item}) => <Message item={item} />}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={{flexDirection: 'column-reverse'}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    margin: 32,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#cfdee7',
    borderRadius: 16,
  },
  messageContainer: {
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0a369d',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 18,
  },
});
