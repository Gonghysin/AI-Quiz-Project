<template>
    <div class="home-container">
      <!-- 背景渐变 -->
      <div class="gradient-background"></div>
      
      <!-- 主内容 -->
      <div class="content-wrapper">
        <!-- 主标题部分 -->
        <div class="headline-section">
          <p class="subtitle">线下看对眼，上线开对战！</p>
          <h1 class="title">囚徒困境中的AI知识竞赛</h1>
          <p class="main-question">"想和现场的友友比比谁对AI知识、AI历史、AI梗更了解吗？"</p>
        </div>
        
        <!-- 核心特性 -->
        <div class="feature-section">
          <div class="feature-card">
            <p>⚡ 这不是普通问答！这是一场被AI监控的策略智慧测试！你会是完美的"囚徒"吗？</p>
          </div>
          <div class="feature-card">
            <p>🔮 两个参与者，两轮对决，无数可能结果！你的每次选择都将揭示真实的你！</p>
          </div>
        </div>
        
        <!-- 游戏规则 -->
        <div class="rules-section">
          <div class="rule-block">
            <p class="highlight-text">"在现场选择一位友友来进行知识竞赛！"</p>
            <p class="highlight-text">"游戏一共2轮，每轮双方都会收到对方给自己选择的3道题目！"</p>
          </div>

          <div class="prisoner-dilemma">
            <p class="dilemma-text">"囚徒困境：题目的难度有「中等难」、「很难」、「特别难」三种难度！双方可以选择合作，都给对方选择简单的题目，合作共赢。或者，有人选择背叛对方，以换取更大利益？"</p>
            
            <!-- 积分场景列表 -->
            <div class="scenarios-list">
              <div class="scenario-item" @click="toggleScenario('A')">
                <div class="scenario-header">
                  <h3>场景 A：双方都合作</h3>
                  <span class="toggle-icon" :class="{ 'is-open': openScenarios.A }">▼</span>
                </div>
                <div class="scenario-content" v-show="openScenarios.A">
                  <div class="scenario-desc">
                    <p>- 我：出简单题给对方</p>
                    <p>- 对方：出简单题给我</p>
                    <p>- 分数相对稳定，中等偏上</p>
                  </div>
                  <div class="score-table">
                    <div class="table-header">
                      <span>答题结果</span>
                      <span>我的得分</span>
                      <span>对方得分</span>
                      <span>说明</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答对</span>
                      <span>3</span>
                      <span>3</span>
                      <span>合作共赢，彼此都轻松拿到 3 分</span>
                    </div>
                    <div class="table-row">
                      <span>我对、他错</span>
                      <span>3</span>
                      <span>0</span>
                      <span>我成功，他失败</span>
                    </div>
                    <div class="table-row">
                      <span>我错、他对</span>
                      <span>0</span>
                      <span>3</span>
                      <span>他成功，我失败</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答错</span>
                      <span>0</span>
                      <span>0</span>
                      <span>双双失误，谁也没得到分</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="scenario-item" @click="toggleScenario('B')">
                <div class="scenario-header">
                  <h3>场景 B：双方都背叛</h3>
                  <span class="toggle-icon" :class="{ 'is-open': openScenarios.B }">▼</span>
                </div>
                <div class="scenario-content" v-show="openScenarios.B">
                  <div class="scenario-desc">
                    <p>- 我：出难题给对方</p>
                    <p>- 对方：出难题给我</p>
                    <p>- 风险最高，但可能也有高额回报</p>
                  </div>
                  <div class="score-table">
                    <div class="table-header">
                      <span>答题结果</span>
                      <span>我的得分</span>
                      <span>对方得分</span>
                      <span>说明</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答对</span>
                      <span>2</span>
                      <span>2</span>
                      <span>虽然都顶住难题，但因互相背叛，单人收益并不算高</span>
                    </div>
                    <div class="table-row">
                      <span>我对、他错</span>
                      <span>5</span>
                      <span>0</span>
                      <span>我成为唯一成功者，大获 5 分</span>
                    </div>
                    <div class="table-row">
                      <span>我错、他对</span>
                      <span>0</span>
                      <span>5</span>
                      <span>他成功，我失败</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答错</span>
                      <span>0</span>
                      <span>0</span>
                      <span>付出高风险，结果两败俱伤，无人得分</span>
                    </div>
                  </div>
                  <p class="note">这里满足你提到的"若一人对、一人错，则正确的一方得 5 分"。</p>
                </div>
              </div>

              <div class="scenario-item" @click="toggleScenario('C')">
                <div class="scenario-header">
                  <h3>场景 C：我背叛，对方合作</h3>
                  <span class="toggle-icon" :class="{ 'is-open': openScenarios.C }">▼</span>
                </div>
                <div class="scenario-content" v-show="openScenarios.C">
                  <div class="scenario-desc">
                    <p>- 我：出难题给对方（背叛）</p>
                    <p>- 对方：出简单题给我（合作）</p>
                    <p>- 如果我背叛失败（我没答对），就直接拿 0 分</p>
                  </div>
                  <div class="score-table">
                    <div class="table-header">
                      <span>答题结果</span>
                      <span>我的得分</span>
                      <span>对方得分</span>
                      <span>说明</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答对</span>
                      <span>2</span>
                      <span>4</span>
                      <span>我虽答对了简单题，但对方顶住了难题，是更大的赢家</span>
                    </div>
                    <div class="table-row">
                      <span>我对、他错</span>
                      <span>5</span>
                      <span>0</span>
                      <span>我背叛并成功，对方合作却失手，0 分</span>
                    </div>
                    <div class="table-row">
                      <span>我错、他对</span>
                      <span>0</span>
                      <span>6</span>
                      <span>我背叛失败且自己答错，而对方顶住了难题，获得最大的6分奖励！</span>
                    </div>
                    <div class="table-row">
                      <span>双方都答错</span>
                      <span>0</span>
                      <span>1</span>
                      <span>我空手而归，但对方因为被背叛了，得到1分补偿分。</span>
                    </div>
                  </div>
                  <p class="note">注意你特别强调的"<strong>我背叛但答错就拿 0 分</strong>"已体现在此表：只要我错就是 0。</p>
                </div>
              </div>
            </div>
          </div>

          <div class="strategy-highlight">
            <p>👽 合作出简单题？背叛出难题？策略性思考与AI知识的终极挑战！</p>
          </div>
        </div>
        
        <!-- 特别提示 -->
        <div class="special-notes">
          <div class="note-card warning">
            <p>🧪 警告：我们已记录到87.3%的参与者在体验后产生强烈的"再玩一次"冲动！</p>
          </div>
          <div class="note-card reward">
            <p>🌟 成功通过测试的参与者将获得"囚徒困境策略大师"徽章与神秘AI礼品！</p>
          </div>
          <div class="note-card time">
            <p>⏱️ 全程仅需5分钟，但这5分钟可能改变你对策略思维的所有认知！</p>
          </div>
        </div>
        
        <!-- 结束召唤 -->
        <div class="final-call">
          <p>准备好面对自己的选择了吗？囚徒困境等待你的智慧解锁！✨🔍🎯</p>
        </div>
        
        <!-- 登录部分 -->
        <div class="login-section">
          <div class="login-tabs">
            <button 
              class="tab-button" 
              :class="{ active: !isRegister }"
              @click="switchTab(false)"
            >
              登录
            </button>
            <button 
              class="tab-button" 
              :class="{ active: isRegister }"
              @click="switchTab(true)"
            >
              注册
            </button>
          </div>
          <div class="login-form">
            <input 
              type="text" 
              v-model="userId" 
              placeholder="请输入您的2050 ID" 
              class="id-input"
              :disabled="loading"
            />
            <input 
              v-if="isRegister"
              type="text" 
              v-model="nickname" 
              placeholder="请输入您的昵称" 
              class="id-input"
              :disabled="loading"
            />
            <button 
              class="login-button" 
              @click="isRegister ? handleRegister() : handleLogin()"
              :disabled="loading || (isRegister && (!userId || !nickname)) || (!isRegister && !userId)"
            >
              {{ loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '开始挑战') }}
            </button>
            <p v-if="error" class="error-message">{{ error }}</p>
            <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          </div>
        </div>

        <!-- 底部导航 -->
        <div class="bottom-nav">
          <button class="nav-button leaderboard" @click="navigateTo('leaderboard')">
            <span class="icon">🏆</span>
            <span>排行榜</span>
          </button>
          <button class="nav-button rewards" @click="navigateTo('rewards')">
            <span class="icon">🎁</span>
            <span>查看奖励</span>
          </button>
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
        nickname: '',
        openScenarios: {
          A: false,
          B: false,
          C: false
        },
        loading: false,
        error: '',
        successMessage: '',
        isRegister: false
      }
    },
    methods: {
      async handleLogin() {
        if (!this.userId.trim()) {
          this.error = '请输入2050 ID';
          return;
        }
        
        try {
          this.loading = true;
          this.error = '';
          this.successMessage = '';
          
          // 调用登录接口
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: this.userId.trim() })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || '登录失败，请重试');
          }
          
          // 保存用户信息到本地存储
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('nickname', data.nickname);
          
          // 重定向到匹配页面
          this.$router.push({ name: 'match' });
        } catch (err) {
          this.error = err.message || '登录时发生错误，请重试';
          console.error('登录错误:', err);
        } finally {
          this.loading = false;
        }
      },
      async handleRegister() {
        if (!this.userId.trim() || !this.nickname.trim()) {
          this.error = '请输入完整的用户信息';
          return;
        }
        
        try {
          this.loading = true;
          this.error = '';
          this.successMessage = '';
          
          // 调用注册接口
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: this.userId.trim(), nickname: this.nickname.trim() })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || '注册失败，请重试');
          }
          
          // 显示成功消息，并自动切换到登录页
          this.successMessage = '注册成功！请登录开始游戏';
          setTimeout(() => {
            this.isRegister = false;
          }, 1500);
        } catch (err) {
          this.error = err.message || '注册时发生错误，请重试';
          console.error('注册错误:', err);
        } finally {
          this.loading = false;
        }
      },
      toggleScenario(scenario) {
        this.openScenarios[scenario] = !this.openScenarios[scenario];
      },
      navigateTo(route) {
        this.$router.push({ name: route });
      },
      switchTab(isRegister) {
        this.isRegister = isRegister;
        this.error = '';
        this.successMessage = '';
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
    z-index: -1;
  }
  
  .content-wrapper {
    max-width: 1000px;
    margin: 0 auto;
    padding: 60px 20px;
  }
  
  /* 主标题样式 */
  .headline-section {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .subtitle {
    font-size: 32px;
    color: #86868b;
    margin-bottom: 16px;
    font-weight: 500;
  }
  
  .title {
    font-size: 48px;
    font-weight: 700;
    background: linear-gradient(90deg, #007aff, #5856d6);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 20px;
  }
  
  .main-question {
    font-size: 28px;
    color: #1d1d1f;
    font-weight: 500;
  }
  
  /* 特性卡片 */
  .feature-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .feature-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .feature-card p {
    font-size: 20px;
    line-height: 1.5;
    margin: 0;
  }
  
  /* 规则部分 */
  .rules-section {
    margin-bottom: 40px;
  }
  
  .rule-block {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .highlight-text {
    font-size: 24px;
    color: #007aff;
    margin: 15px 0;
  }
  
  .prisoner-dilemma {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
  
  .dilemma-text {
    font-size: 20px;
    line-height: 1.6;
    margin-bottom: 25px;
  }
  
  /* 积分场景列表 */
  .scenarios-list {
    margin-top: 30px;
  }
  
  .scenario-item {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .scenario-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .scenario-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 122, 255, 0.05);
  }
  
  .scenario-header h3 {
    margin: 0;
    font-size: 20px;
    color: #1d1d1f;
  }
  
  .toggle-icon {
    font-size: 14px;
    transition: transform 0.3s ease;
    color: #007aff;
  }
  
  .toggle-icon.is-open {
    transform: rotate(180deg);
  }
  
  .scenario-content {
    padding: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .scenario-content p {
    margin: 8px 0;
    font-size: 16px;
    color: #494949;
  }
  
  .score-row {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: rgba(0, 122, 255, 0.05);
    border-radius: 8px;
    margin: 12px 0;
  }
  
  .result {
    color: #007aff;
    font-weight: 500;
  }
  
  /* 策略强调 */
  .strategy-highlight {
    text-align: center;
    font-size: 22px;
    margin: 30px 0;
    color: #5856d6;
  }
  
  /* 特别提示卡片 */
  .special-notes {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .note-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .note-card.warning {
    border-left: 4px solid #ff3b30;
  }
  
  .note-card.reward {
    border-left: 4px solid #34c759;
  }
  
  .note-card.time {
    border-left: 4px solid #ff9500;
  }
  
  .note-card p {
    font-size: 18px;
    margin: 0;
  }
  
  /* 结束召唤 */
  .final-call {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    margin: 40px 0;
    color: #1d1d1f;
  }
  
  /* 登录部分 */
  .login-section {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .login-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .tab-button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f5f5f7;
    color: #494949;
    margin: 0 5px;
    min-width: 100px;
  }
  
  .tab-button.active {
    background: #007aff;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
    font-weight: 600;
  }
  
  .tab-button:hover:not(.active) {
    background: #e6e6e6;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 25px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
  
  .id-input {
    padding: 16px 20px;
    font-size: 16px;
    border-radius: 12px;
    border: none;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .login-button {
    padding: 16px 20px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 12px;
    border: none;
    background: #007aff;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }
  
  .login-button:hover {
    background: #0066d6;
    transform: translateY(-2px);
  }
  
  /* 登录按钮状态 */
  .login-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
  
  /* 错误消息 */
  .error-message {
    color: #ff3b30;
    margin-top: 12px;
    font-size: 14px;
    text-align: center;
  }
  
  /* 成功消息 */
  .success-message {
    color: #34c759;
    margin-top: 12px;
    font-size: 14px;
    text-align: center;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .content-wrapper {
      padding: 40px 20px;
    }
    
    .subtitle {
      font-size: 24px;
    }
    
    .title {
      font-size: 36px;
    }
    
    .main-question {
      font-size: 22px;
    }
    
    .feature-card p,
    .dilemma-text {
      font-size: 18px;
    }
    
    .scenario-header h3 {
      font-size: 18px;
    }
    
    .scenario-content p {
      font-size: 14px;
    }
  }

  .scenario-desc {
    background: rgba(0, 122, 255, 0.05);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .scenario-desc p {
    margin: 8px 0;
    font-size: 16px;
    color: #494949;
    line-height: 1.6;
  }

  .score-table {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 2.5fr;
    background: #007aff;
    color: white;
    padding: 12px;
    font-weight: 600;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 2.5fr;
    padding: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-header span,
  .table-row span {
    padding: 0 8px;
  }

  .note {
    margin-top: 16px;
    padding: 12px;
    background: rgba(255, 149, 0, 0.1);
    border-radius: 8px;
    color: #ff9500;
    font-size: 14px;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .table-header,
    .table-row {
      grid-template-columns: 1fr 0.8fr 0.8fr 1.5fr;
      font-size: 14px;
    }
    
    .scenario-desc p {
      font-size: 14px;
    }
  }

  /* 底部导航 */
  .bottom-nav {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-top: 60px;
    padding: 20px;
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    color: #1d1d1f;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 200px;
  }

  .nav-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .nav-button .icon {
    font-size: 24px;
  }

  .nav-button.leaderboard:hover {
    background: #5856d6;
    color: white;
  }

  .nav-button.rewards:hover {
    background: #ff9500;
    color: white;
  }

  @media (max-width: 768px) {
    .bottom-nav {
      flex-direction: column;
      gap: 16px;
      margin-top: 40px;
    }
    
    .nav-button {
      width: 100%;
      justify-content: center;
      padding: 20px 32px;
    }
  }
  </style>