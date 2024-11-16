import fs from "fs";
import path from "path";
import { exec } from "child_process";

class PiperService {
  #config;
  #obj;
  constructor(config) {
    if (!this.isValidConfig(config)) {
      throw new Error('Invalid configuration object');
    }
    this.#config = config;
    this.#obj = {
      audioContent: "BASE64",
      timepoints: [], 
      audioConfig: {
        audioEncoding: "",
        speakingRate: 1,
        pitch: 0,
        volumeGainDb: 0,
        sampleRateHertz: 24000,
        effectsProfileId: [],
      },
    };
  }

  isValidConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }
    // const requiredKeys = ['audioContent', 'timepoints', 'audioConfig'];
    // for (const key of requiredKeys) {
    //   if (!(key in config)) {
    //     return false;
    //   }
    // }
    return true;
  }

  async convertTextToAudio() {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.piperRun({ text: this.#config.text, model: this.#config.name, rate: this.#config.rate });
        if (result) {
          console.log('Piper Run Command Result:', result);
          const filePath = path.resolve("./audio/test.wav");
          await this.convertAudioToBase64(filePath);
          resolve({ success: true, data: this.#obj.audioContent});
          // const whisperResult = await nodewhisper(filePath, {
          //   modelName: 'base.en', // Downloaded models name
          //   autoDownloadModelName: 'base.en', // (optional) autodownload a model if model is not present
          //   verbose: true,
          //   whisperOptions: {
          //     outputInText: false, // get output result in txt file
          //     outputInVtt: false, // get output result in vtt file
          //     outputInSrt: true, // get output result in srt file
          //     outputInCsv: true, // get output result in csv file
          //     translateToEnglish: false, // translate from source language to english
          //     wordTimestamps: false, // Word-level timestamps
          //     timestamps_length: 1, // amount of dialogue per timestamp pair
          //     splitOnWord: true, // split on word rather than on token
          //   },
          // });
          // if (whisperResult) {
          //   const jsonResult = await convertCSVToJSON('./audio/test.wav.csv');
          //   resolve(jsonResult);
          // }
        }
      } catch (error) {
        console.error('An error occurred:', error);
        reject(error);
      }
    });
  }


  async convertAudioToBase64(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          reject(err); 
          return;
        }
        const base64Data = Buffer.from(data).toString("base64");
        this.#obj.audioContent = base64Data;
        resolve(); 
      });
    });
  }

  async piperRun({ text, model, rate }) {
    return new Promise((resolve, reject) => {
      const command = `./piper/piper --model ./piper/model/${model} --length_scale ${rate} --output_file ./audio/test.wav`;
      exec(`echo "${text}" | ${command}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
          reject(error);
          return;
        }
        console.log(`stdout: ${stdout}`);
        resolve(stdout);
        console.error(`stderr: ${stderr}`);
      });
    });
  }

}

export default PiperService;


