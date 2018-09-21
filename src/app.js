const prompt = require('prompt');
const colors = require("colors/safe");

const { writeFile } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const writeFileSync = promisify(writeFile);

const asyncPrompt = require('./lib/async-prompt').asyncPrompt;
const requests = require('./lib/requests');

const filename = 'answers.txt';

async function start() {

  // Clear default message from prompt
  prompt.message = '';

  // Start the prompt
  prompt.start();

  // Introduction
  console.log(colors.yellow.underline('\n ---- Quizs ---- \n'));
  console.log(colors.yellow.bold('Choisissez un quiz dans la liste.'));
  console.log(colors.yellow.bold('Répondez au questions de ce quiz.'));
  console.log(colors.yellow.bold('Si plusieurs réponses sont possibles, séparez vos réponses par ","'));
  console.log(colors.yellow.bold('À la fin du quiz, un fichier "answers.txt" sera automatiquement généré.'));
  console.log(colors.yellow.bold('N\'oubliez pas de commiter ce fichier ;) '));
  console.log(colors.red.bold('Si vous avez déjà répondu au quiz, le fichier précédemment créé sera automatiquement supprimé.'));

  // Selection quiz
  console.log(colors.blue.bold('\nChoisissez le numéro du quiz auquel vous voulez participer :'));
  const quizs = await requests.getAvailableQuizs();
  for (let i = 0; i < quizs.length; i++) {
    const quiz = quizs[i];
    console.log(colors.blue(`${quiz.id}: ${quiz.nom}`));
  }
  console.log(colors.blue('0: Quitter l\'application'));
  const selectionQuiz = await asyncPrompt(['Choix']);
  const idQuiz = +selectionQuiz['Choix'];

  if (idQuiz === 0) {
    console.log(colors.green.bold('Au revoir !'));
    prompt.stop();
    return;
  }

  // Initialize answers
  let answers = '';

  // Get questions from quiz
  try {
    const quiz = await requests.getQuizById(idQuiz);
    const nbQuestions = quiz.questions.length;
    
    console.log(colors.green.bold(`\n **** ${quiz.nom} ****`));
    console.log(colors.green.bold(' ---- C\'est parti !!! ---- \n'));
  
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
      const answer = await asyncPrompt(['Réponse']);
      answers += (`Q.${i + 1}: ${answer['Réponse']}\n`);
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
        console.log(colors.green.italic('Vos réponses ont bien été enregistrées.'));
        console.log(colors.green.italic('Merci d\'avoir participé à ce quiz!'));
      } catch (e) {
        console.log(colors.red.italic('Error : ', e));
        console.log(colors.red.italic('Abort creating file.'));
        console.log('');
      }
    }
  } catch(e) {
    console.log(colors.red.bold('\nError : ', e.response.data.err));
    console.log(colors.red.bold('L\'application va s\'arrêter\n'));
  } finally {
    // Stop prompt
    prompt.stop();
  }
  
};

module.exports = {
  start,
};
