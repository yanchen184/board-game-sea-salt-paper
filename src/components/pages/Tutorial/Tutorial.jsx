import { useState } from 'react'
import './Tutorial.css'

/**
 * Tutorial Component - PPT Style Game Guide
 *
 * Interactive slideshow explaining how to play Sea Salt & Paper
 */
function Tutorial() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "歡迎來到海鹽與紙牌",
      subtitle: "Sea Salt & Paper",
      content: "一款 2-4 人的策略卡牌遊戲",
      image: "/tutorial/01-homepage.png",
      tips: [
        "收集卡牌組成配對",
        "搶先達到目標分數",
        "支援 AI 對手練習"
      ]
    },
    {
      title: "第一步：創建或加入房間",
      subtitle: "開始遊戲",
      content: "在首頁創建新房間或輸入房間代碼加入好友的遊戲",
      image: "/tutorial/02-lobby.png",
      tips: [
        "點擊「創建房間」開始新遊戲",
        "分享房間代碼給朋友",
        "可以添加 AI 對手練習"
      ]
    },
    {
      title: "第二步：邀請玩家",
      subtitle: "準備開始",
      content: "添加 AI 對手或等待真人玩家加入",
      image: "/tutorial/03-lobby-with-ai.png",
      tips: [
        "點擊「添加 AI」加入電腦對手",
        "AI 有不同難度等級",
        "至少需要 2 名玩家才能開始"
      ]
    },
    {
      title: "遊戲畫面介紹",
      subtitle: "認識遊戲介面",
      content: "了解遊戲各區域的功能",
      image: "/tutorial/04-gameboard.png",
      tips: [
        "中央：抽牌堆和兩個棄牌堆",
        "上方：對手區域（顯示手牌數量）",
        "下方：你的手牌區",
        "右側：計分板和行動紀錄"
      ]
    },
    {
      title: "回合流程：抽牌",
      subtitle: "每回合第一步",
      content: "從牌堆抽牌或從棄牌堆拿牌",
      image: "/tutorial/05-card-selection.png",
      tips: [
        "點擊牌堆抽 2 張牌",
        "選擇 1 張保留，1 張棄掉",
        "或直接拿棄牌堆頂的牌"
      ]
    },
    {
      title: "回合流程：打出配對",
      subtitle: "獲得分數",
      content: "將手牌中相同的卡牌配對打出",
      image: "/tutorial/06-player-hand.png",
      tips: [
        "相同名稱的卡牌可以配對",
        "配對後獲得基礎分數",
        "某些配對有特殊效果"
      ]
    },
    {
      title: "配對效果卡",
      subtitle: "配對時觸發特殊效果",
      content: null,
      cardTypes: [
        { emoji: "🐟", name: "魚 Fish", count: 7, effect: "配對後可以盲抽一張牌" },
        { emoji: "🦀", name: "螃蟹 Crab", count: 9, effect: "配對後可以從棄牌堆拿牌" },
        { emoji: "⛵", name: "帆船 Sailboat", count: 8, effect: "配對後可以再行動一次" },
        { emoji: "🦈", name: "鯊魚 Shark", count: 5, effect: "與游泳者配對可偷取對手的牌" },
        { emoji: "🏊", name: "游泳者 Swimmer", count: 5, effect: "與鯊魚配對可偷取對手的牌" }
      ]
    },
    {
      title: "收集卡",
      subtitle: "收集越多分數越高",
      content: null,
      cardTypes: [
        { emoji: "🐚", name: "貝殼 Shell", count: 6, effect: "收集計分：1分/張（章魚加成×2）" },
        { emoji: "🐙", name: "章魚 Octopus", count: 5, effect: "加成卡：讓貝殼分數×2" },
        { emoji: "🐧", name: "企鵝 Penguin", count: 3, effect: "加成卡：讓配對獎勵×2" },
        { emoji: "👨‍🌾", name: "水手 Sailor", count: 2, effect: "收集計分：1張=0分, 2張=5分" }
      ]
    },
    {
      title: "倍增卡",
      subtitle: "強化其他卡牌的分數",
      content: null,
      cardTypes: [
        { emoji: "🗼", name: "燈塔 Lighthouse", count: 1, effect: "每張帆船額外 +1 分" },
        { emoji: "🐟🐟", name: "魚群 FishSchool", count: 1, effect: "每張魚額外 +1 分" },
        { emoji: "🐧👥", name: "企鵝部落 PenguinColony", count: 1, effect: "每張企鵝額外 +2 分" },
        { emoji: "👨‍✈️", name: "船長 Captain", count: 1, effect: "每張水手額外 +3 分" }
      ]
    },
    {
      title: "特殊卡：美人魚",
      subtitle: "最強大的計分卡",
      content: null,
      cardTypes: [
        { emoji: "🧜", name: "美人魚 Mermaid", count: 4, effect: "第1張=最多顏色數量，第2張=次多顏色數量" }
      ],
      tips: [
        "美人魚根據你手牌中最多的顏色計分",
        "例如：有 5 張藍色牌，第一張美人魚就值 5 分",
        "收集 4 張美人魚可以直接獲勝！"
      ]
    },
    {
      title: "計分規則",
      subtitle: "如何獲勝",
      content: null,
      scoring: [
        { icon: "🎴", rule: "卡牌面值", desc: "每張卡牌的數字就是分數" },
        { icon: "💎", rule: "配對獎勵", desc: "打出配對額外獲得分數" },
        { icon: "🌈", rule: "顏色加成", desc: "同色卡牌越多加成越高" },
        { icon: "🧜‍♀️", rule: "美人魚", desc: "根據最多/次多顏色計分" },
        { icon: "🏆", rule: "目標分數", desc: "先達到 30 分的玩家獲勝" }
      ]
    },
    {
      title: "遊戲結束",
      subtitle: "宣告結算",
      content: "當你認為分數足夠時，可以選擇結束遊戲",
      tips: [
        "「結束遊戲」：直接結算，你不會再抽牌",
        "「最後機會」：其他玩家還有一回合",
        "選擇時機很重要！"
      ],
      highlight: true
    },
    {
      title: "準備好了嗎？",
      subtitle: "開始你的冒險！",
      content: "現在就開始遊戲，成為海鹽與紙牌的高手！",
      tips: [
        "多練習幾場熟悉規則",
        "觀察對手的策略",
        "享受遊戲的樂趣！"
      ],
      cta: true
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const slide = slides[currentSlide]

  return (
    <div className="tutorial">
      {/* Progress Bar */}
      <div className="tutorial__progress">
        <div
          className="tutorial__progress-bar"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide Counter */}
      <div className="tutorial__counter">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Main Slide Content */}
      <div className={`tutorial__slide ${slide.highlight ? 'tutorial__slide--highlight' : ''}`}>
        <div className="tutorial__header">
          <h1 className="tutorial__title">{slide.title}</h1>
          <p className="tutorial__subtitle">{slide.subtitle}</p>
        </div>

        <div className="tutorial__body">
          {/* Image Section */}
          {slide.image && (
            <div className="tutorial__image-container">
              <img
                src={slide.image}
                alt={slide.title}
                className="tutorial__image"
              />
            </div>
          )}

          {/* Content Section */}
          {slide.content && (
            <p className="tutorial__content">{slide.content}</p>
          )}

          {/* Tips List */}
          {slide.tips && (
            <ul className="tutorial__tips">
              {slide.tips.map((tip, index) => (
                <li key={index} className="tutorial__tip">
                  <span className="tutorial__tip-icon">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}

          {/* Card Types Grid */}
          {slide.cardTypes && (
            <div className="tutorial__cards-grid">
              {slide.cardTypes.map((card, index) => (
                <div key={index} className="tutorial__card-type">
                  <span className="tutorial__card-emoji">{card.emoji}</span>
                  <div className="tutorial__card-info">
                    <span className="tutorial__card-name">{card.name}</span>
                    {card.count && (
                      <span className="tutorial__card-count">× {card.count} 張</span>
                    )}
                  </div>
                  <span className="tutorial__card-effect">{card.effect}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scoring Rules */}
          {slide.scoring && (
            <div className="tutorial__scoring">
              {slide.scoring.map((rule, index) => (
                <div key={index} className="tutorial__scoring-item">
                  <span className="tutorial__scoring-icon">{rule.icon}</span>
                  <div className="tutorial__scoring-text">
                    <strong>{rule.rule}</strong>
                    <span>{rule.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {slide.cta && (
            <div className="tutorial__cta">
              <a href="/" className="tutorial__cta-button">
                🎮 開始遊戲
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="tutorial__nav">
        <button
          className="tutorial__nav-btn tutorial__nav-btn--prev"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          ← 上一頁
        </button>

        {/* Dot Navigation */}
        <div className="tutorial__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`tutorial__dot ${index === currentSlide ? 'tutorial__dot--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="tutorial__nav-btn tutorial__nav-btn--next"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          下一頁 →
        </button>
      </div>

      {/* Home Link */}
      <a href="/" className="tutorial__home-link">
        🏠 返回首頁
      </a>
    </div>
  )
}

export default Tutorial
