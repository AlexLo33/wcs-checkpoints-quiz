const prompt = require('prompt');
const colors = require("colors/safe");
const i18n = require("i18n");

const asyncPrompt = require('./lib/async-prompt').asyncPrompt;
const requests = require('./lib/requests');
const quiz = require('./quizs');

i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  directory: __dirname + '/locales',
  register: global,
});

async function start() {

  // Clear default message from prompt
  prompt.message = '';

  // Start the prompt
  prompt.start();

  let keep = true;

  while (keep) {

    // Introduction
    console.log(colors.yellow.underline('\n ---- Quizs ---- \n'));
    console.log(colors.yellow.bold(__('intro_1')));
    console.log(colors.yellow.bold(__('intro_2')));
    console.log(colors.yellow.bold(__('intro_3')));
    console.log(colors.yellow.bold(__('intro_4')));
    console.log(colors.yellow.bold(__('intro_5')));
    console.log(colors.red.bold(__('warning_1')));

    // Selection quiz
    console.log(colors.blue.bold(__('menu_title')));
    const quizs = await requests.getAvailableQuizs();
    for (let i = 0; i < quizs.length; i++) {
      const quiz = quizs[i];
      console.log(colors.yellow(`${quiz.id}: ${quiz.nom}`));
    }
    console.log(colors.blue.bold(__('menu_lang')));
    console.log(colors.blue.bold(__('menu_quit')));
    const selectionQuiz = await asyncPrompt(['>']);
    const userChoice = +selectionQuiz['>'];

    switch (true) {
      case (userChoice === 0):
        console.log(colors.yellow(__('lang_title')));
        console.log(colors.yellow(__('lang_1')));
        console.log(colors.yellow(__('lang_2')));
        const selectLang = await asyncPrompt(['>']);
        if (+selectLang['>'] === 1) {
          i18n.setLocale('fr');
        } else {
          i18n.setLocale('en');
        }
        break;
      case (userChoice > 0):
        await quiz.startQuiz(i18n, userChoice);
        console.log(colors.blue.bold(__('press_any_key')));
        await asyncPrompt(['>']);
        break;
      case (userChoice.toString().toLowerCase() === "q"):
      default:
        keep = false;
        console.log(colors.green.bold(__('bye')));
    }
  }
  prompt.stop();
};

module.exports = {
  start,
};
