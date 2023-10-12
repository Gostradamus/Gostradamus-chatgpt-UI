
import { useState, useClient, createHandler } from 'seniman';
import speech from '@google-cloud/speech';

export function Microphone(props) {
  let [isSpeechMode, set_isSpeechMode] = useState(false);
  let client = useClient();

  let clientModuleInitialized = false;

  let speechInputClient;
  let gspeech_stream;

