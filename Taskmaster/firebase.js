const firebaseConfig = {
    apiKey: "AIzaSyDSb6em9Pk8Z-xjPyRmzpcU_DYdFd12P4k",
    authDomain: "taskmaster-19436.firebaseapp.com",
    databaseURL: "https://taskmaster-19436-default-rtdb.firebaseio.com",
    projectId: "taskmaster-19436",
    storageBucket: "taskmaster-19436.firebasestorage.app",
    messagingSenderId: "26527596417",
    appId: "1:26527596417:web:0971755a9bfa9772357280"
  };
  
  // Inicializa o Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Cria as variáveis globais
  const auth = firebase.auth();
  const db = firebase.database();
  
  // Deixa acessível em outros arquivos
  window.auth = auth;
  window.db = db;
  