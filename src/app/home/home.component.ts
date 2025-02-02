import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, SecurityContext, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as annyang from 'annyang';


@Component({
  selector: 'voznote-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class HomeComponent {
  note: string = '';
  toasts: any[] = [];
  headerConf = {
    title: "VozNote`🎤",
    desc: "Let Your Voice Do the Typing...!"
  }
  @ViewChild('toaster', { static: false }) toaster!: ElementRef;
  languageStrings: any = {
    en: {
      voiceTriggertext: 'VozNote`, Start Listening 🎤',
      name: 'English',
      shareText: 'Share 🔄',
      clearText: 'Clear ❌',
      downloadText: 'Download ⬇️',
      copyText: 'Copy 📋'
    },
    es: {
      voiceTriggertext: 'VozNote`, Comenzar a escuchar 🎤',
      name: 'Español',
      shareText: 'Compartir 🔄',
      clearText: 'Borrar ❌',
      downloadText: 'Descargar ⬇️',
      copyText: 'Copiar 📋'
    },
    fr: {
      voiceTriggertext: 'VozNote`, Commencer à écouter 🎤',
      shareText: 'Partager 🔄',
      name: 'Français',
      clearText: 'Effacer ❌',
      downloadText: 'Télécharger ⬇️',
      copyText: 'Copier 📋'
    },
    de: {
      voiceTriggertext: 'VozNote`, Beginnen zu hören 🎤',
      shareText: 'Teilen 🔄',
      name: 'Deutsch',
      clearText: 'Löschen ❌',
      downloadText: 'Herunterladen ⬇️',
      copyText: 'Kopieren 📋'
    },
    it: {
      voiceTriggertext: 'VozNote`,Inizia ad ascoltare 🎤',
      shareText: 'Condividi 🔄',
      name: 'Italiano',
      clearText: 'Cancella ❌',
      downloadText: 'Scarica ⬇️',
      copyText: 'Copia 📋'
    },
    ta: {
      voiceTriggertext: 'VozNote`,கேட்கத் தொடங்கு 🎤',
      name: 'தமிழ்',
      shareText: 'பகிர் 🔄',
      clearText: 'மாய்க்கவும் ❌',
      downloadText: 'பதிவிறக்க ⬇️',
      copyText: 'நகல் எடுக்க 📋'
    }
  };



  recognition: any;

  isListening: boolean = false;
  isProcessing: boolean = false;
  selectedLanguage: string = 'en';

  constructor(private zone: NgZone, private purifyDOM: DomSanitizer) {
   // this.initializeSpeechRecognition();
  }

  // initializeSpeechRecognition() {
  //   const { webkitSpeechRecognition, SpeechRecognition }: any = window as any;
  //   this.recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  //   this.recognition.lang = 'en-US';
  //   // this.recognition.interimResults = true;
  //   this.recognition.continuous = true;
  //   this.recognition.maxAlternatives = 1;
  // }


  startListening() {
    if (annyang) {
      this.isListening = true;
      this.isProcessing = true;
      this.showToast('info', 'Voznote` Listening Started!', 'Info');

      // Command setup
      const commands = {
        '*text': (text: string) => {
          this.zone.run(() => {
            this.note += text.trim() + ' ';
            this.saniitizeText(this.note);
            this.isProcessing = false;
          });
        }
      };

      annyang.addCommands(commands);

      annyang.addCallback('error', (error: any) => {
        this.isListening = false;
        this.isProcessing = false;
          // Try to restart listening on error
      if (error.error === 'network' || error.error === 'no-speech') {
        console.log('Attempting to restart listening...');
        this.startListening(); // Attempt to restart
      } else {
        this.showToast('error', 'Error while listening to voice!', 'Error');
        console.error('Speech recognition error:', error);
      }

      });

      annyang.addCallback('end', () => {
        this.isListening = false;
        this.isProcessing = false;
        this.showToast('info', 'Voznote` listening ended due to inactivity!', 'Info');
      });

      annyang.start({ autoRestart: true, continuous: true });
    } else {
      this.showToast('error', 'Voznote` listening not supported!', 'Error');
    }
  }


  stopListening() {
    if (annyang) {
      this.showToast('info', 'Voznote` Listening Stopped!', 'Info');
      annyang.abort();  // Stops recognition immediately
      this.isListening = false;
    }
  }

  toggleListening() {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  shareNote() {
    if (!this.note) return;
    if (navigator.share) {
      navigator.share({
        title: 'VozNote',
        text: this.note // Only share the text
      })
        .then(() => this.showToast('success', 'Sharing note!', 'Success'))
        .catch((error) => {
          console.log('Error sharing:', error)
          this.showToast('error', 'Error while sharing!', 'Error');
        });
    } else {
      this.showToast('error', 'Your Device is not supported!', 'Error');
    }
  }

  clearNote() {
    this.note = '';
    this.isListening = false;
    this.showToast('info', 'Notes are cleared!', 'Info');
  }

  downloadNoteAsText() {
    if (!this.note) return;
    const blob = new Blob([this.note], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voznote.txt';
    a.click();
    this.showToast('success', 'Notes downloaded successfully!', 'Success')
  }

  get voiceTriggertext() {
    return this.isListening ? this.languageStrings[this.selectedLanguage].voiceTriggertext + '🎤...' : '🟢 🎙️';
  }




  copyToClipboard() {
    if (!this.note) return;
    navigator.clipboard.writeText(this.note).then(() => {
      this.showToast('success', 'Text successfully copied to clipboard!', 'Success');
    }).catch((err) => {
      console.error('Error copying text: ', err);
      this.showToast('error', 'Error while copying text!', 'Error');
    });
  }
  changeLanguage() {
    this.showToast('warning', 'Listening stopped!', 'Warning');
    this.stopListening();
    // this.recognition.lang = this.selectedLanguage;
    annyang.setLanguage(this.selectedLanguage);

    this.showToast('info', 'Language changed to ' + this.languageStrings[this.selectedLanguage].name, 'Info');
  }


  selectedLanguageName(lang: any) {
    return this.languageStrings[lang].name
  }


  showToast(type: string, message: string, title: string = '') {
    const toast = { type, message, title, id: new Date().getTime() };
    this.toasts.push(toast);

    setTimeout(() => {
      this.removeToast(toast);
    }, 5000); // Remove toast after 5 seconds
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t.id !== toast.id);
  }

  saniitizeText(text: string) {
    text = this.purifyDOM.sanitize(SecurityContext.HTML, text) || '';
    text = this.purifyDOM.sanitize(SecurityContext.URL, text) || '';
    text = this.purifyDOM.sanitize(SecurityContext.STYLE, text) || '';
    // text = this.purifyDOM.sanitize(SecurityContext.SCRIPT, text) || '';
    return text;
  }
}
