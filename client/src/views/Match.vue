<template>
  <div class="match-container">
    <div class="gradient-background"></div>
    
    <!-- 页面标题 -->
    <header class="match-header">
      <h1>AI知识对战</h1>
      <div class="user-display">
        <span class="user-id-badge">ID: {{ myId }}</span>
      </div>
      <div class="round-info" v-if="matchId">
        <span class="round-badge">第{{ currentRound }}轮</span>
        <span class="user-info">{{ myNickname }} vs {{ opponentNickname }}</span>
      </div>
    </header>

    <!-- Step 1: 创建或加入房间 -->
    <div class="match-step" v-if="currentStep === 1">
      <div class="step-card">
        <h2>Step 1: 创建或加入房间</h2>
        <p class="step-description">创建一个新房间或加入已有房间，开始一场囚徒困境对战！</p>
        
        <div class="room-options">
          <!-- 创建房间选项 -->
          <div class="option-card" v-if="!showJoinRoom">
            <h3>创建新房间</h3>
            <p>创建一个新的游戏房间，等待对手加入</p>
            <button 
              @click="createRoom"
              :disabled="loading"
              class="action-button"
            >
              {{ loading ? '创建中...' : '创建房间' }}
            </button>
          </div>
          
          <!-- 加入房间选项 -->
          <div class="option-card" v-if="!showJoinRoom">
            <h3>加入已有房间</h3>
            <p>输入对手ID加入游戏</p>
            <button 
              @click="showJoinRoom = true"
              :disabled="loading"
              class="action-button secondary"
            >
              加入对战
            </button>
          </div>
          
          <!-- 输入对手ID界面 -->
          <div class="join-room-form" v-if="showJoinRoom">
            <h3>加入对战</h3>
            <div class="input-group">
              <input 
                type="text"
                v-model="opponentId"
                placeholder="请输入对手ID"
                :disabled="loading"
                class="room-input"
              />
              <div class="button-group">
                <button 
                  @click="joinRoomByOpponentId"
                  :disabled="!opponentId || loading"
                  class="action-button"
                >
                  {{ loading ? '加入中...' : '确认加入' }}
                </button>
                <button 
                  @click="showJoinRoom = false"
                  :disabled="loading"
                  class="action-button secondary"
                >
                  返回
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 房间创建成功后显示房间ID -->
        <div class="room-info" v-if="matchId && currentStep === 1">
          <h3>房间已创建</h3>
          <p>房间ID: <span class="room-id">{{ matchId }}</span></p>
          <p>等待对手加入...</p>
          <div class="loader"></div>
        </div>
        
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>

    <!-- Step 2: 选择策略（为对手选题目难度） -->
    <div class="match-step" v-if="currentStep === 2">
      <div class="step-card">
        <h2>Step 2: 选择策略</h2>
        <p class="step-description">给对手出什么难度的题目？这将决定你的得分可能！</p>
        
        <div class="strategy-options">
          <div 
            class="strategy-card" 
            :class="{ selected: strategy === 'cooperate' }"
            @click="selectStrategy('cooperate')"
          >
            <div class="strategy-icon">🤝</div>
            <h3>合作</h3>
            <p>为对手出简单题目</p>
            <div class="strategy-details">
              <span>可能得分: 2-3分</span>
              <span>风险: 低</span>
            </div>
          </div>
          
          <div 
            class="strategy-card" 
            :class="{ selected: strategy === 'betray' }"
            @click="selectStrategy('betray')"
          >
            <div class="strategy-icon">🔥</div>
            <h3>背叛</h3>
            <p>为对手出难题</p>
            <div class="strategy-details">
              <span>可能得分: 0-5分</span>
              <span>风险: 高</span>
            </div>
          </div>
        </div>
        
        <button 
          @click="submitStrategy"
          :disabled="!strategy || strategySubmitted || loading"
          class="action-button"
        >
          {{ loading ? '提交中...' : '确认策略' }}
        </button>
        
        <div v-if="strategySubmitted" class="waiting-status">
          <p>已选择{{ strategy === 'cooperate' ? '合作' : '背叛' }}策略，等待对手选择...</p>
          <div class="loader"></div>
        </div>
      </div>
    </div>

    <!-- Step 3: 抽题环节 -->
    <div class="match-step" v-if="currentStep === 3">
      <div class="step-card">
        <h2>Step 3: 抽题环节</h2>
        <p class="step-description">
          题目将自动轮播，点击"锁定"选择当前题目。需选择3道题目。
        </p>
        
        <div class="questions-container">
          <!-- 题目轮播区 -->
          <div class="question-carousel">
            <div class="current-question" v-if="currentQuestion">
              <h3>{{ currentQuestion.questionText }}</h3>
              <div class="options">
                <div 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  class="option"
                >
                  {{ ['A', 'B', 'C', 'D'][index] }}. {{ option }}
                </div>
              </div>
            </div>
            
            <button 
              @click="lockCurrentQuestion"
              :disabled="selectedQuestions.length >= 3 || isQuestionLocked"
              class="action-button lock-button"
            >
              {{ isQuestionLocked ? '已锁定' : '锁定此题' }}
            </button>
          </div>
          
          <!-- 已选题目列表 -->
          <div class="selected-questions">
            <h3>已选题目 ({{ selectedQuestions.length }}/3)</h3>
            <div class="selected-list">
              <div 
                v-for="(question, index) in selectedQuestions" 
                :key="index"
                class="selected-item"
              >
                <span class="question-index">{{ index + 1 }}</span>
                <span class="question-text">{{ truncateText(question.questionText, 50) }}</span>
              </div>
              
              <div v-for="i in (3 - selectedQuestions.length)" :key="`empty-${i}`" class="selected-item empty">
                <span class="question-index">{{ selectedQuestions.length + i }}</span>
                <span class="question-text">等待选择...</span>
              </div>
            </div>
            
            <button 
              @click="confirmQuestions"
              :disabled="selectedQuestions.length < 3 || loading"
              class="action-button confirm-button"
            >
              {{ loading ? '准备中...' : '确认题目并开始答题' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: 答题环节 -->
    <div class="match-step" v-if="currentStep === 4">
      <div class="step-card answer-section">
        <h2>Step 4: 答题环节</h2>
        <p class="step-description">
          请回答以下3个问题。你有5分钟时间完成所有问题。
        </p>
        
        <div class="timer-bar" v-if="timeRemaining > 0">
          <div class="timer-progress" :style="{ width: `${(timeRemaining / totalTime) * 100}%` }"></div>
          <span class="timer-text">剩余时间: {{ formatTime(timeRemaining) }}</span>
        </div>
        
        <div class="question-navigation">
          <button 
            v-for="(_, index) in selectedQuestions" 
            :key="index"
            @click="currentQuestionIndex = index"
            :class="{ active: currentQuestionIndex === index, answered: userAnswers[index] !== null }"
            class="nav-button"
          >
            {{ index + 1 }}
          </button>
        </div>
        
        <div class="question-content" v-if="currentDisplayQuestion">
          <h3 class="question-title">问题 {{ currentQuestionIndex + 1 }}/3</h3>
          <p class="question-text">{{ currentDisplayQuestion.questionText }}</p>
          
          <div class="answer-options">
            <div 
              v-for="(option, index) in currentDisplayQuestion.options" 
              :key="index"
              @click="selectAnswer(index)"
              :class="{ selected: userAnswers[currentQuestionIndex] === index }"
              class="answer-option"
            >
              <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
          
          <div class="navigation-buttons">
            <button 
              @click="prevQuestion" 
              :disabled="currentQuestionIndex === 0"
              class="nav-action-button"
            >
              上一题
            </button>
            <button 
              v-if="currentQuestionIndex < selectedQuestions.length - 1"
              @click="nextQuestion"
              class="nav-action-button primary"
            >
              下一题
            </button>
            <button 
              v-else
              @click="submitAnswers"
              :disabled="!allQuestionsAnswered || loading"
              class="nav-action-button primary"
            >
              {{ loading ? '提交中...' : '提交答案' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 轮次结果展示 -->
    <div class="match-step" v-if="currentStep === 5">
      <div class="step-card result-card">
        <h2>本轮结果</h2>
        
        <div class="round-result">
          <div class="player-result">
            <h3>{{ myNickname }}</h3>
            <div class="score">{{ roundScore.myScore }} 分</div>
            <div class="strategy-badge" :class="strategy">
              {{ strategy === 'cooperate' ? '选择合作' : '选择背叛' }}
            </div>
            <div class="correct-answers">
              答对: {{ roundScore.myCorrect.filter(Boolean).length }}/3
            </div>
          </div>
          
          <div class="vs-divider">VS</div>
          
          <div class="player-result">
            <h3>{{ opponentNickname }}</h3>
            <div class="score">{{ roundScore.opponentScore }} 分</div>
            <div class="strategy-badge" :class="opponentStrategy">
              {{ opponentStrategy === 'cooperate' ? '选择合作' : '选择背叛' }}
            </div>
            <div class="correct-answers">
              答对: {{ roundScore.opponentCorrect.filter(Boolean).length }}/3
            </div>
          </div>
        </div>
        
        <div class="result-message" :class="getResultClass()">
          {{ getResultMessage() }}
        </div>
        
        <button 
          v-if="currentRound < totalRounds"
          @click="startNextRound"
          class="action-button"
        >
          开始第{{ currentRound + 1 }}轮
        </button>
        
        <button 
          v-else
          @click="viewFinalResult"
          class="action-button"
        >
          查看最终结果
        </button>
      </div>
    </div>

    <p v-if="currentStep > 3" class="placeholder-text">更多步骤将在下一部分实现...</p>
  </div>
</template>

<script>
export default {
  name: 'Match',
  data() {
    return {
      // 用户信息
      myId: '',
      myNickname: '',
      opponentId: '',
      opponentNickname: '对手',
      
      // 房间相关
      roomId: '',
      showJoinRoom: false,
      
      // 比赛状态
      matchId: null,
      currentStep: 1,
      currentRound: 1,
      strategy: null, // 'cooperate' 或 'betray'
      strategySubmitted: false,
      bothReady: false,
      
      // UI状态
      loading: false,
      error: '',
      
      // 轮询间隔
      pollInterval: null,

      // 抽题相关
      questionPool: [],
      currentQuestion: null,
      selectedQuestions: [],
      isQuestionLocked: false,
      carouselInterval: null,
      carouselSpeed: 1000, // 轮播速度(ms)
      
      // 答题相关
      currentQuestionIndex: 0,
      userAnswers: [null, null, null], // 用户的答案
      timeRemaining: 300, // 5分钟 = 300秒
      totalTime: 300,
      timerInterval: null,
      
      // 轮次相关
      totalRounds: 2, // 根据文档，总共两轮比赛
      opponentStrategy: null,
      roundScore: {
        myScore: 0,
        opponentScore: 0,
        myCorrect: [false, false, false],
        opponentCorrect: [false, false, false]
      }
    }
  },
  computed: {
    // 当前显示的问题
    currentDisplayQuestion() {
      return this.selectedQuestions[this.currentQuestionIndex];
    },
    
    // 是否已回答所有问题
    allQuestionsAnswered() {
      return this.userAnswers.every(answer => answer !== null);
    }
  },
  created() {
    // 从localStorage获取用户信息
    this.myId = localStorage.getItem('userId');
    this.myNickname = localStorage.getItem('nickname');
    
    // 如果没有用户ID，重定向到登录页
    if (!this.myId) {
      this.$router.push({ name: 'home' });
    }
  },
  methods: {
    // 加入房间（通过对手ID）
    async joinRoomByOpponentId() {
      if (!this.opponentId || this.loading) return;
      
      this.loading = true;
      this.error = '';
      
      try {
        // 按照文档要求，通过对手ID请求匹配
        const requestResponse = await fetch('/api/match/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.myId,
            targetId: this.opponentId
          })
        });
        
        const requestData = await requestResponse.json();
        
        if (!requestResponse.ok) {
          throw new Error(requestData.message || '匹配对手失败');
        }
        
        // 保存比赛ID
        this.matchId = requestData.matchId;
        
        // 获取对手昵称
        this.opponentNickname = requestData.opponentNickname || `用户${this.opponentId}`;
        
        // 进入下一步
        this.currentStep = 2;
        
      } catch (err) {
        this.error = err.message || '加入对战时出错，请重试';
        console.error('匹配对手错误:', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 创建房间
    async createRoom() {
      if (this.loading) return;
      
      this.loading = true;
      this.error = '';
      
      try {
        // 创建比赛/房间
        const createResponse = await fetch('/api/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user1_id: this.myId
          })
        });
        
        const createData = await createResponse.json();
        
        if (!createResponse.ok) {
          throw new Error(createData.message || '创建房间失败');
        }
        
        // 保存比赛/房间ID
        this.matchId = createData.matchId;
        
        // 开始轮询检查是否有玩家加入
        this.startPollingForOpponent();
        
      } catch (err) {
        this.error = err.message || '创建房间时出错，请重试';
        console.error('创建房间错误:', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 轮询检查是否有玩家加入
    startPollingForOpponent() {
      this.pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/match/${this.matchId}/progress?user=${this.myId}`);
          const data = await response.json();
          
          // 检查是否有玩家加入
          if (data.opponentJoined) {
            // 有玩家加入，停止轮询，进入下一步
            clearInterval(this.pollInterval);
            this.currentStep = 2;
            
            // 获取对手昵称
            this.opponentNickname = data.opponentNickname || '对手';
          }
        } catch (err) {
          console.error('轮询错误:', err);
        }
      }, 2000); // 每2秒检查一次
    },
    
    // Step 2: 选择策略
    selectStrategy(strategy) {
      if (!this.strategySubmitted) {
        this.strategy = strategy;
      }
    },
    
    // 提交策略
    async submitStrategy() {
      if (!this.strategy || this.strategySubmitted || this.loading) return;
      
      this.loading = true;
      
      try {
        // 修改API路径，添加round参数
        const response = await fetch(`/api/match/${this.matchId}/choose-strategy/${this.currentRound}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.myId,
            strategy: this.strategy
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '提交策略失败');
        }
        
        this.strategySubmitted = true;
        
        // 开始轮询检查对手是否也提交了策略
        this.startPollingOpponentStatus();
        
      } catch (err) {
        this.error = err.message || '提交策略时出错，请重试';
        console.error('提交策略错误:', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 轮询检查对手状态
    startPollingOpponentStatus() {
      this.pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/match/${this.matchId}/progress?user=${this.myId}`);
          const data = await response.json();
          
          // 检查对手是否提交了策略
          if (data.opponentSubmittedStrategy) {
            // 对手已提交策略，停止轮询，准备进入下一步
            this.bothReady = true;
            clearInterval(this.pollInterval);
            this.prepareForQuestionSelection();
          }
        } catch (err) {
          console.error('轮询错误:', err);
        }
      }, 2000); // 每2秒检查一次
    },
    
    // 准备进入抽题阶段
    async prepareForQuestionSelection() {
      this.currentStep = 3;
      
      try {
        // 获取题目池
        const response = await fetch(`/api/match/${this.matchId}/questions?user=${this.myId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('获取题目失败');
        }
        
        this.questionPool = data;
        this.startQuestionCarousel();
      } catch (err) {
        this.error = '获取题目失败，请刷新页面重试';
        console.error('获取题目错误:', err);
      }
    },
    
    // 开始题目轮播
    startQuestionCarousel() {
      let index = 0;
      
      // 设置第一个题目
      this.currentQuestion = this.questionPool[0];
      
      // 开始轮播
      this.carouselInterval = setInterval(() => {
        if (!this.isQuestionLocked) {
          index = (index + 1) % this.questionPool.length;
          this.currentQuestion = this.questionPool[index];
        }
      }, this.carouselSpeed);
    },
    
    // 锁定当前题目
    lockCurrentQuestion() {
      if (this.selectedQuestions.length >= 3 || this.isQuestionLocked) return;
      
      this.isQuestionLocked = true;
      this.selectedQuestions.push(this.currentQuestion);
      
      // 短暂延迟后重新开始轮播
      setTimeout(() => {
        this.isQuestionLocked = false;
      }, 1000);
    },
    
    // 确认题目并开始答题
    async confirmQuestions() {
      if (this.selectedQuestions.length < 3 || this.loading) return;
      
      // 停止轮播
      clearInterval(this.carouselInterval);
      
      this.loading = true;
      
      try {
        // 调用API标记用户已锁定题目
        const response = await fetch(`/api/match/${this.matchId}/lock-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.myId,
            questions: this.selectedQuestions.map(q => q.questionId || q.id)
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '锁定题目失败');
        }
        
        // 进入答题环节
        this.currentStep = 4;
        
        // 开始计时
        this.startAnswerTimer();
      } catch (err) {
        this.error = '准备答题时出错，请重试';
        console.error('准备答题错误:', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 截断文本，用于显示长题目
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    // 选择答案
    selectAnswer(optionIndex) {
      this.$set(this.userAnswers, this.currentQuestionIndex, optionIndex);
    },
    
    // 上一题
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    
    // 下一题
    nextQuestion() {
      if (this.currentQuestionIndex < this.selectedQuestions.length - 1) {
        this.currentQuestionIndex++;
      }
    },
    
    // 开始答题计时器
    startAnswerTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          // 时间到，自动提交答案
          this.submitAnswers();
        }
      }, 1000);
    },
    
    // 提交答案
    async submitAnswers() {
      if (this.loading) return;
      
      // 停止计时器
      clearInterval(this.timerInterval);
      
      this.loading = true;
      
      try {
        // 提交答案到服务器
        const response = await fetch(`/api/match/${this.matchId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.myId,
            answers: this.userAnswers.map(index => index !== null ? ['A', 'B', 'C', 'D'][index] : '')
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '提交答案失败');
        }
        
        // 开始轮询查看对手是否也提交了答案
        this.pollForRoundCompletion();
        
      } catch (err) {
        this.error = err.message || '提交答案时出错，请重试';
        console.error('提交答案错误:', err);
      } finally {
        this.loading = false;
      }
    },
    
    // 轮询检查轮次是否完成
    pollForRoundCompletion() {
      this.pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/match/${this.matchId}/progress?user=${this.myId}`);
          const data = await response.json();
          
          if (data.opponentSubmitted) {
            // 对手已提交答案，停止轮询，获取本轮结果
            clearInterval(this.pollInterval);
            this.fetchRoundResult();
          }
        } catch (err) {
          console.error('轮询错误:', err);
        }
      }, 2000);
    },
    
    // 获取本轮结果
    async fetchRoundResult() {
      try {
        const response = await fetch(`/api/match/${this.matchId}/results`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('获取结果失败');
        }
        
        // 提取当前轮次结果
        const roundData = data.rounds[this.currentRound - 1];
        
        // 更新轮次得分数据
        this.roundScore = {
          myScore: data.user1_id === this.myId ? roundData.user1_score : roundData.user2_score,
          opponentScore: data.user1_id === this.myId ? roundData.user2_score : roundData.user1_score,
          myCorrect: data.user1_id === this.myId ? roundData.user1_correct : roundData.user2_correct,
          opponentCorrect: data.user1_id === this.myId ? roundData.user2_correct : roundData.user1_correct
        };
        
        // 获取对手的策略
        const roundStrategy = data.strategies[`round${this.currentRound}`];
        this.opponentStrategy = data.user1_id === this.myId ? roundStrategy.user2 : roundStrategy.user1;
        
        // 显示结果页面
        this.currentStep = 5;
        
      } catch (err) {
        this.error = '获取结果失败，请刷新页面';
        console.error('获取结果错误:', err);
      }
    },
    
    // 开始下一轮
    startNextRound() {
      this.currentRound++;
      this.strategy = null;
      this.strategySubmitted = false;
      this.selectedQuestions = [];
      this.userAnswers = [null, null, null];
      this.timeRemaining = this.totalTime;
      this.currentQuestionIndex = 0;
      
      // 回到选择策略步骤
      this.currentStep = 2;
    },
    
    // 查看最终结果
    viewFinalResult() {
      this.$router.push({ name: 'result', params: { id: this.matchId } });
    },
    
    // 格式化时间
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // 获取结果样式类
    getResultClass() {
      if (this.roundScore.myScore > this.roundScore.opponentScore) {
        return 'win';
      } else if (this.roundScore.myScore < this.roundScore.opponentScore) {
        return 'lose';
      } else {
        return 'draw';
      }
    },
    
    // 获取结果消息
    getResultMessage() {
      if (this.roundScore.myScore > this.roundScore.opponentScore) {
        return '恭喜！你在本轮获胜了！';
      } else if (this.roundScore.myScore < this.roundScore.opponentScore) {
        return '很遗憾，对手在本轮获胜。';
      } else {
        return '本轮平局！';
      }
    },
    
    // 组件销毁时清除所有计时器
    beforeDestroy() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
      
      if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
      }
      
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  }
}
</script>

<style scoped>
.match-container {
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  padding: 20px;
  color: #1d1d1f;
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

/* 用户ID显示 */
.user-display {
  position: absolute;
  top: 20px;
  left: 20px;
}

.user-id-badge {
  background: #007aff;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.3);
}

/* 房间选项样式 */
.room-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.option-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  width: 45%;
  min-width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.option-card:hover {
  transform: translateY(-5px);
}

.join-room-form {
  background: white;
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.room-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.action-button.secondary {
  background-color: #6c757d;
}

.room-info {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.room-id {
  font-weight: bold;
  font-size: 1.2em;
  color: #4a6cf7;
  background: #f0f4ff;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
  margin: 0 5px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  margin: 15px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.match-header {
  text-align: center;
  margin-bottom: 40px;
}

.match-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #007aff, #5856d6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.round-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.round-badge {
  background: #007aff;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  font-size: 18px;
  font-weight: 500;
}

.match-step {
  max-width: 800px;
  margin: 0 auto;
}

.step-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.step-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #007aff;
}

.step-description {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 24px;
  color: #494949;
}

.input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.opponent-input {
  flex-grow: 1;
  padding: 14px 16px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.action-button {
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: #007aff;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #0066d6;
  transform: translateY(-2px);
}

.action-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  color: #ff3b30;
  margin-top: 12px;
  font-size: 14px;
}

.strategy-options {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.strategy-card {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.strategy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.strategy-card.selected {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.05);
}

.strategy-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.strategy-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.strategy-card p {
  font-size: 16px;
  color: #494949;
  margin-bottom: 16px;
}

.strategy-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #86868b;
}

.waiting-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 122, 255, 0.3);
  border-radius: 50%;
  border-top-color: #007aff;
  animation: spin 1s linear infinite;
  margin-top: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.placeholder-text {
  text-align: center;
  margin: 50px 0;
  font-size: 18px;
  color: #86868b;
}

@media (max-width: 768px) {
  .match-header h1 {
    font-size: 28px;
  }
  
  .step-card {
    padding: 20px;
  }
  
  .step-card h2 {
    font-size: 20px;
  }
  
  .step-description {
    font-size: 16px;
  }
  
  .strategy-options {
    flex-direction: column;
  }
}

/* 抽题环节样式 */
.questions-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.question-carousel {
  flex: 1.5;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.current-question {
  flex-grow: 1;
  margin-bottom: 20px;
}

.current-question h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 16px;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.option {
  background: rgba(0, 122, 255, 0.05);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
}

.lock-button {
  align-self: center;
  min-width: 120px;
}

.selected-questions {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.selected-questions h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #007aff;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  flex-grow: 1;
}

.selected-item {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 122, 255, 0.05);
}

.selected-item.empty {
  opacity: 0.6;
  background: rgba(0, 0, 0, 0.05);
}

.question-index {
  width: 24px;
  height: 24px;
  background: #007aff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
}

.question-text {
  font-size: 14px;
  flex-grow: 1;
}

.confirm-button {
  align-self: center;
  min-width: 200px;
}

@media (max-width: 768px) {
  .questions-container {
    flex-direction: column;
  }
  
  .options {
    grid-template-columns: 1fr;
  }
}

/* 答题环节样式 */
.answer-section {
  max-width: 800px;
}

.timer-bar {
  height: 10px;
  background: #e6e6e6;
  border-radius: 5px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #34c759, #007aff);
  border-radius: 5px;
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  right: 10px;
  top: -20px;
  font-size: 14px;
  color: #86868b;
}

.question-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #007aff;
  background: white;
  color: #007aff;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.nav-button.active {
  background: #007aff;
  color: white;
}

.nav-button.answered {
  border-color: #34c759;
  color: #34c759;
}

.nav-button.active.answered {
  background: #34c759;
  color: white;
  border-color: #34c759;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #007aff;
}

.question-text {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.answer-option {
  padding: 16px;
  border-radius: 10px;
  background: rgba(0, 122, 255, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.answer-option:hover {
  background: rgba(0, 122, 255, 0.1);
}

.answer-option.selected {
  background: rgba(0, 122, 255, 0.2);
  border: 1px solid #007aff;
}

.option-letter {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

.option-text {
  flex-grow: 1;
  font-size: 16px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
}

.nav-action-button {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  background: #f5f5f7;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-action-button:hover {
  background: #e6e6e6;
}

.nav-action-button.primary {
  background: #007aff;
  color: white;
}

.nav-action-button.primary:hover {
  background: #0066d6;
}

.nav-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 轮次结果样式 */
.result-card {
  text-align: center;
}

.round-result {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin: 30px 0;
}

.player-result {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 200px;
}

.player-result h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.score {
  font-size: 40px;
  font-weight: 700;
  color: #007aff;
  margin-bottom: 16px;
}

.strategy-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.strategy-badge.cooperate {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.strategy-badge.betray {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.correct-answers {
  font-size: 14px;
  color: #86868b;
}

.vs-divider {
  font-size: 24px;
  font-weight: 700;
  color: #86868b;
}

.result-message {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-block;
}

.result-message.win {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.result-message.lose {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.result-message.draw {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

@media (max-width: 768px) {
  .round-result {
    flex-direction: column;
    gap: 20px;
  }
  
  .player-result {
    width: 100%;
  }
  
  .vs-divider {
    display: none;
  }
}
</style>
