const prompt = require('prompt');
const colors = require("colors/safe");

const { writeFile } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const writeFileSync = promisify(writeFile);

const asyncPrompt = require('./lib/async-prompt').asyncPrompt;
const requests = require('./lib/requests');

const filename = 'answers.txt';

async function startQuiz(i18n, idQuiz) {
  // Initialize answers
  let answers = '';

  // Get questions from quiz
  try {
    throw new Error();
    const quiz = await requests.getQuizById(idQuiz);
    const nbQuestions = quiz.questions.length;

    console.log(colors.green.bold(__('quiz_start_1 %s', quiz.nom)));
    console.log(colors.green.bold(__('quiz_start_2')));

    // Loop for each questions
    for (let i = 0; i < nbQuestions; i++) {
      console.log(colors.red.bold(`\n Question ${i + 1} :`));
      const question = quiz.questions[i];
      console.log(colors.blue.bold(` ${question.question}`));

      const responses = question.reponses;
      for (let j = 0; j < responses.length; j++) {
        const reponse = responses[j];
        console.log(colors.blue(`    ${reponse.position}: ${reponse.nom}`));
      }
      console.log('');
      const answer = await asyncPrompt(['>']);
      answers += (`Q.${i + 1}: ${answer['>']}\n`);
      console.log(colors.green.bold('\n  ---------------------------------'));
    }

    try {
      // Try to remove previous answers
      await exec(`rm ${filename}`);
    } catch (e) { }
    finally {
      try {
        // Write answers
        await writeFileSync(`./${filename}`, answers);
        console.log(colors.green.italic(__('quiz_end_1')));
        console.log(colors.green.italic(__('quiz_end_2')));
      } catch (e) {
        console.log(colors.red.italic(__('error %s', e.toString())));
        console.log(colors.red.italic(__('error_abort_create_file')));
        console.log('');
      }
    }
  } catch (e) {
    console.log(colors.red.italic(__('error %s', e.response ? e.response.data.err : "Unexpected Error")));
    console.log(colors.red.italic(__('error_application_stop')));
  }
};

module.exports = {
  startQuiz,
};