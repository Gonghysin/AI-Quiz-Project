<template>
    <div class="home-container">
      <!-- 背景渐变 -->
      <div class="gradient-background"></div>
      
      <!-- 主内容 -->
      <div class="content-wrapper">
        <!-- 标题和口号 -->
        <div class="headline-section">
          <h1 class="title">AI 对战挑战</h1>
          <p class="slogan">线下看对眼，上线开对战！</p>
        </div>
        
        <!-- 项目简介 -->
        <div class="intro-section">
          <h2>关于项目</h2>
          <p>AI对战挑战是一个激动人心的知识竞赛平台，让您与线下相识的朋友展开智力比拼。通过答题累积积分，赢取精美奖品。</p>
        </div>
        
        <!-- 玩法规则 -->
        <div class="rules-section">
          <h2>游戏规则</h2>
          <div class="rule-cards">
            <div class="rule-card">
              <div class="rule-number">01</div>
              <div class="rule-text">输入2050 ID登录系统</div>
            </div>
            <div class="rule-card">
              <div class="rule-number">02</div>
              <div class="rule-text">与对手配对进行比赛</div>
            </div>
            <div class="rule-card">
              <div class="rule-number">03</div>
              <div class="rule-text">3轮比赛，每轮3道题目</div>
            </div>
            <div class="rule-card">
              <div class="rule-number">04</div>
              <div class="rule-text">答对题目获得积分，累积完成题目</div>
            </div>
          </div>
        </div>
        
        <!-- 登录部分 -->
        <div class="login-section">
          <h2>开始挑战</h2>
          <div class="login-form">
            <input 
              type="text" 
              v-model="userId" 
              placeholder="请输入您的2050 ID" 
              class="id-input"
            />
            <button class="login-button" @click="handleLogin">登录</button>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button class="nav-button match-button" @click="navigateTo('match')">开始比赛</button>
          <button class="nav-button leaderboard-button" @click="navigateTo('leaderboard')">排行榜</button>
          <button class="nav-button rewards-button" @click="navigateTo('rewards')">奖励中心</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Home',
    data() {
      return {
        userId: '',
      }
    },
    methods: {
      handleLogin() {
        // 登录逻辑，后续添加接口调用
        console.log('登录ID:', this.userId);
        if (this.userId.trim()) {
          // 跳转到比赛页面
          this.navigateTo('match');
        }
      },
      navigateTo(route) {
        this.$router.push({ name: route });
      }
    }
  }
  </script>
  
  <style scoped>
  .home-container {
    min-height: 100vh;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1d1d1f;
    overflow-x: hidden;
  }
  
  .gradient-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    z-index: -1;
  }
  
  .content-wrapper {
    max-width: 980px;
    margin: 0 auto;
    padding: 80px 20px;
  }
  
  /* 标题和口号 */
  .headline-section {
    text-align: center;
    margin-bottom: 60px;
  }
  
  .title {
    font-size: 56px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
    background: linear-gradient(90deg, #007aff, #5856d6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .slogan {
    font-size: 28px;
    font-weight: 400;
    color: #86868b;
  }
  
  /* 项目简介 */
  .intro-section {
    margin-bottom: 60px;
    text-align: center;
  }
  
  .intro-section h2 {
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 20px;
  }
  
  .intro-section p {
    font-size: 20px;
    line-height: 1.5;
    max-width: 780px;
    margin: 0 auto;
    color: #494949;
  }
  
  /* 玩法规则 */
  .rules-section {
    margin-bottom: 60px;
  }
  
  .rules-section h2 {
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .rule-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }
  
  .rule-card {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .rule-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
  
  .rule-number {
    font-size: 36px;
    font-weight: 700;
    color: #007aff;
    margin-bottom: 10px;
  }
  
  .rule-text {
    font-size: 18px;
    line-height: 1.4;
  }
  
  /* 登录部分 */
  .login-section {
    margin-bottom: 60px;
    text-align: center;
  }
  
  .login-section h2 {
    font-size: 32px;
    font-weight: 500;
    margin-bottom: 30px;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .id-input {
    width: 100%;
    padding: 16px 20px;
    font-size: 18px;
    border-radius: 12px;
    border: none;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }
  
  .id-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3), 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .login-button {
    width: 100%;
    padding: 16px 20px;
    font-size: 18px;
    font-weight: 500;
    border-radius: 12px;
    border: none;
    background-color: #007aff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .login-button:hover {
    background-color: #0066d6;
    transform: translateY(-2px);
  }
  
  .login-button:active {
    transform: translateY(0);
  }
  
  /* 导航按钮 */
  .navigation-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .nav-button {
    padding: 18px 24px;
    font-size: 18px;
    font-weight: 500;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    text-align: center;
  }
  
  .match-button {
    background-color: #5856d6;
    color: white;
  }
  
  .match-button:hover {
    background-color: #4b49b7;
    transform: translateY(-2px);
  }
  
  .leaderboard-button {
    background-color: white;
    color: #1d1d1f;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .leaderboard-button:hover {
    background-color: #f5f5f7;
    transform: translateY(-2px);
  }
  
  .rewards-button {
    background-color: white;
    color: #1d1d1f;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .rewards-button:hover {
    background-color: #f5f5f7;
    transform: translateY(-2px);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .content-wrapper {
      padding: 60px 20px;
    }
    
    .title {
      font-size: 40px;
    }
    
    .slogan {
      font-size: 22px;
    }
    
    .intro-section h2,
    .rules-section h2,
    .login-section h2 {
      font-size: 28px;
    }
    
    .intro-section p {
      font-size: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .title {
      font-size: 32px;
    }
    
    .slogan {
      font-size: 18px;
    }
    
    .rule-cards {
      grid-template-columns: 1fr;
    }
  }
  </style>