// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyB3t0HmfYP-SgKQPuEYY4-Fp8QSWTR9Wr4",
    authDomain: "bladeecho-d4cd3.firebaseapp.com",
    databaseURL: "https://bladeecho-d4cd3-default-rtdb.firebaseio.com",
    projectId: "bladeecho-d4cd3",
    storageBucket: "bladeecho-d4cd3.firebasestorage.app",
    messagingSenderId: "695036343376",
    appId: "1:695036343376:web:6cd98206668494fa694d55",
    measurementId: "G-VEYN06K5BW"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();

console.log('Firebase initialized successfully');
