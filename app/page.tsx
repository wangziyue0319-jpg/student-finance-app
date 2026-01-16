"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 投资目标类型
type InvestmentGoal = "短期冲冠" | "长期豪门" | "运营维稳";

// 风险承受类型
type RiskTolerance = "无限进攻" | "防守反击";

// 资金规模
type FundLevel = "5000以下" | "5000-20000" | "20000以上";

// 市场环境
type MarketCondition = "牛市" | "震荡市" | "熊市";

// 投资者知识水平
type KnowledgeLevel = "新手" | "入门" | "进阶" | "专业";

// 推荐配置结果
interface PortfolioRecommendation {
  strategy: string;
  marketCondition: MarketCondition;
  knowledgeLevel: KnowledgeLevel;
  recommendedProducts: {
    type: 'ETF' | '股票' | '基金';
    name: string;
    code: string;
    reason: string;
    riskLevel: string;
    suggestedAmount: string;
  }[];
  stockPicks: {
    name: string;
    code: string;
    reason: string;
    sector: string;
  }[];
  riskWarning: string;
  tacticalAdvice: string;
  knowledgeAssessment: string;
}

// ETF数据库
const ETF_DATABASE = {
  沪深300ETF: { code: "510300", name: "华泰柏瑞沪深300ETF", description: "跟踪沪深300指数" },
  中证500ETF: { code: "510500", name: "南方中证500ETF", description: "跟踪中证500指数" },
  创业板ETF: { code: "159915", name: "易方达创业板ETF", description: "跟踪创业板指数" },
  科创50ETF: { code: "588000", name: "华夏科创50ETF", description: "跟踪科创50指数" },
  证券ETF: { code: "512880", name: "国泰证券ETF", description: "跟踪证券公司指数" },
  半导体ETF: { code: "512480", name: "国联安半导体ETF", description: "跟踪半导体产业指数" },
  机器人ETF: { code: "159770", name: "景顺长城机器人ETF", description: "跟踪机器人产业" },
  人工智能ETF: { code: "515070", name: "华夏人工智能ETF", description: "跟踪AI主题" },
  创新药ETF: { code: "159992", name: "银华创新药ETF", description: "跟踪创新药产业指数" },
  红利ETF: { code: "510880", name: "华泰柏瑞红利ETF", description: "高股息策略" },
  低波红利ETF: { code: "563280", name: "华泰柏瑞低波动ETF", description: "低波动策略" },
  价值ETF: { code: "159510", name: "广发价值ETF", description: "价值投资策略" },
  国债ETF: { code: "511010", name: "国泰国债ETF", description: "跟踪国债指数" },
  黄金ETF: { code: "518880", name: "华安黄金ETF", description: "跟踪黄金价格" },
  可转债ETF: { code: "511380", name: "平安可转债ETF", description: "可转债指数" },
  中证医药ETF: { code: "512010", name: "国泰医药ETF", description: "跟踪医药卫生指数" },
  军工ETF: { code: "512660", name: "国泰军工ETF", description: "跟踪中证军工指数" }
};

// 股票数据库
const STOCK_PICKS = {
  牛市: {
    券商: [
      { name: "中信证券", code: "600030", reason: "券商龙头，牛市业绩弹性最大", sector: "券商" },
      { name: "东方财富", code: "300059", reason: "互联网券商，成长性强", sector: "券商" },
      { name: "中金公司", code: "601995", reason: "高端券商，机构业务强", sector: "券商" }
    ],
    科技: [
      { name: "宁德时代", code: "300750", reason: "新能源电池龙头", sector: "新能源" },
      { name: "比亚迪", code: "002594", reason: "新能源汽车龙头", sector: "新能源车" },
      { name: "立讯精密", code: "002475", reason: "消费电子龙头", sector: "电子" }
    ],
    消费: [
      { name: "贵州茅台", code: "600519", reason: "白酒龙头", sector: "消费" },
      { name: "美的集团", code: "000333", reason: "家电龙头", sector: "家电" },
      { name: "五粮液", code: "000858", reason: "高端白酒", sector: "消费" }
    ]
  },
  震荡市: {
    高股息: [
      { name: "工商银行", code: "601398", reason: "银行龙头，股息率约5%", sector: "银行" },
      { name: "建设银行", code: "601939", reason: "国有大行，分红稳定", sector: "银行" },
      { name: "中国神华", code: "601088", reason: "煤炭龙头", sector: "煤炭" }
    ],
    防御: [
      { name: "长江电力", code: "600900", reason: "水电龙头", sector: "电力" },
      { name: "伊利股份", code: "600887", reason: "乳制品龙头", sector: "食品饮料" },
      { name: "海天味业", code: "603288", reason: "调味品龙头", sector: "食品饮料" }
    ]
  },
  熊市: {
    超跌: [
      { name: "招商银行", code: "600036", reason: "零售银行龙头", sector: "银行" },
      { name: "宁波银行", code: "002142", reason: "城商行标杆", sector: "银行" },
      { name: "中国平安", code: "601318", reason: "综合金融", sector: "保险" }
    ]
  }
};

// 市场数据接口
interface MarketData {
  condition: MarketCondition;
  reason: string;
  threeMonthChange: number;
  lastUpdated: string;
}

// 证券市场知识测试题
const KNOWLEDGE_QUESTIONS = [
  {
    id: 1,
    question: "在足球转会市场中，'阵型'（如4-3-3）最主要的作用是什么？",
    options: [
      { text: "决定球队在球场上的战术体系和球员站位", correct: true },
      { text: "决定球员的球衣号码分配", correct: false },
      { text: "决定教练的薪资水平", correct: false },
      { text: "决定球场的草坪维护方式", correct: false }
    ]
  },
  {
    id: 2,
    question: "以下哪种转会策略风险最高？",
    options: [
      { text: "购买成熟球星，支付高额转会费", correct: true },
      { text: "培养青训球员，成本低", correct: false },
      { text: "租借球员，灵活性强", correct: false },
      { text: "免费转会老将，经验丰富", correct: false }
    ]
  },
  {
    id: 3,
    question: "球员身价评估中，'年龄'因素通常如何影响身价？",
    options: [
      { text: "年轻球员潜力溢价，老将身价随年龄下降", correct: true },
      { text: "年龄越大身价越高", correct: false },
      { text: "年龄与身价无关", correct: false },
      { text: "只有30岁球员身价最高", correct: false }
    ]
  },
  {
    id: 4,
    question: "五大联赛（英超、西甲、德甲、意甲、法甲）的比赛时间通常是？",
    options: [
      { text: "周末或周中晚间，具体时间因联赛而异", correct: true },
      { text: "只能在周六下午3点", correct: false },
      { text: "每天固定时间踢比赛", correct: false },
      { text: "只在夏季进行比赛", correct: false }
    ]
  },
  {
    id: 5,
    question: "什么是定投（定期定额投资）？",
    options: [
      { text: "一次性投入全部资金", correct: false },
      { text: "定期定额买入同一投资产品", correct: true },
      { text: "只在市场下跌时买入", correct: false },
      { text: "只投资指数基金", correct: false }
    ]
  },
  {
    id: 6,
    question: "以下哪种情况应该立即止损？",
    options: [
      { text: "投资亏损达到预设止损线", correct: true },
      { text: "市场小幅波动", correct: false },
      { text: "长期价值投资标的", correct: false },
      { text: "看好后市", correct: false }
    ]
  },
  {
    id: 7,
    question: "A股市场的涨跌停限制是？",
    options: [
      { text: "±5%", correct: false },
      { text: "±10%", correct: true },
      { text: "±20%", correct: false },
      { text: "没有涨跌停限制", correct: false }
    ]
  },
  {
    id: 8,
    question: "什么是分红收益率？",
    options: [
      { text: "年度分红总额除以投资本金", correct: true },
      { text: "股票价格上涨百分比", correct: false },
      { text: "基金净值增长率", correct: false },
      { text: "交易手续费率", correct: false }
    ]
  }
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<InvestmentGoal | "">("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance | "">("");
  const [fundLevel, setFundLevel] = useState<FundLevel | "">("");
  const [marketCondition, setMarketCondition] = useState<MarketCondition | "">("");
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel | "">("");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [recommendation, setRecommendation] = useState<PortfolioRecommendation | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(true);

  // 自动获取市场环境
  useEffect(() => {
    const fetchMarketCondition = async () => {
      try {
        const response = await fetch('/api/market');
        const result = await response.json();

        if (result.success && result.data?.analysis) {
          const analysis = result.data.analysis;
          setMarketCondition(analysis.condition as MarketCondition);
          setMarketData({
            condition: analysis.condition as MarketCondition,
            reason: analysis.reason,
            threeMonthChange: result.data.analysis.sixMonthChange || result.data.analysis.avgThreeMonthChange || 0,
            lastUpdated: result.data.lastUpdated
          });
        } else {
          setMarketCondition('震荡市');
          setMarketData({
            condition: '震荡市',
            reason: '无法获取实时数据',
            threeMonthChange: 0,
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('获取市场数据失败:', error);
        setMarketCondition('震荡市');
      } finally {
        setLoadingMarket(false);
      }
    };

    fetchMarketCondition();
  }, []);

  // 计算知识水平
  const calculateKnowledgeLevel = () => {
    const correct = quizAnswers.filter(a => a === 1).length;
    const total = quizAnswers.length;

    if (total === 0) return "新手";

    if (correct <= 2) return "新手";
    if (correct <= 4) return "入门";
    if (correct <= 6) return "进阶";
    return "专业";
  };

  // 根据用户输入和市场环境生成具体产品推荐
  const generateRecommendation = () => {
    // 确保 marketCondition 有效，如果为空则使用默认值
    const validMarketCondition: MarketCondition = marketCondition || '震荡市';

    const userKnowledgeLevel = calculateKnowledgeLevel();
    setKnowledgeLevel(userKnowledgeLevel);
    // 确保 knowledgeLevel 有效
    const validKnowledgeLevel: KnowledgeLevel = userKnowledgeLevel || '新手';

    let strategy = "";
    let recommendedProducts: PortfolioRecommendation["recommendedProducts"] = [];
    let stockPicks: PortfolioRecommendation["stockPicks"] = [];
    let riskWarning = "";
    let tacticalAdvice = "";
    let knowledgeAssessment = "";

    // 根据知识水平评估（仅用于显示反馈，不用于策略区分）
    switch (userKnowledgeLevel) {
      case "新手":
        knowledgeAssessment = "检测到您对证券市场了解较少，建议从基础指数基金开始，逐步积累经验";
        riskWarning = "新手投资者，建议先从低风险产品开始学习";
        break;
      case "入门":
        knowledgeAssessment = "您对证券市场有一定了解，可以尝试更多样化的投资产品";
        riskWarning = "入门水平投资者，建议在控制风险的前提下逐步拓展";
        break;
      case "进阶":
        knowledgeAssessment = "您对证券市场有较好理解，可以适当配置弹性产品";
        riskWarning = "进阶投资者，可根据市场情况灵活调整配置";
        break;
      case "专业":
        knowledgeAssessment = "您对证券市场有深入了解，可以进行更积极的投资操作";
        riskWarning = "专业投资者，可根据市场机会进行战术性配置";
        break;
    }

    const totalFund = fundLevel === "5000以下" ? 5000 : fundLevel === "5000-20000" ? 15000 : 30000;

    // 根据投资风格和市场环境生成策略
    if (riskTolerance === "无限进攻") {
      // 无限进攻风格：不管什么市场环境，都推荐高弹性进攻型标的
      if (validMarketCondition === "牛市") {
        // 牛市：全仓进攻
        strategy = "无限进攻·牛市策略：全仓高弹性进攻型标的";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.证券ETF.name,
            code: ETF_DATABASE.证券ETF.code,
            reason: "券商牛市先锋，弹性最大，把握市场上涨红利",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.25).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.半导体ETF.name,
            code: ETF_DATABASE.半导体ETF.code,
            reason: "科技周期向上，高弹性进攻标的",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.2).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.人工智能ETF.name,
            code: ETF_DATABASE.人工智能ETF.code,
            reason: "AI主题长期成长性强",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.2).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.创新药ETF.name,
            code: ETF_DATABASE.创新药ETF.code,
            reason: "医药创新高成长，牛市弹性大",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.15).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.创业板ETF.name,
            code: ETF_DATABASE.创业板ETF.code,
            reason: "高弹性成长指数，牛市超额收益最强",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.1).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.科创50ETF.name,
            code: ETF_DATABASE.科创50ETF.code,
            reason: "硬科技龙头，长期成长确定",
            riskLevel: "高",
            suggestedAmount: "配置剩余部分"
          }
        ];
        stockPicks = [...STOCK_PICKS.牛市.科技, ...STOCK_PICKS.牛市.券商];
        tacticalAdvice = `牛市全面进攻，配置高弹性ETF如证券ETF(512880)、半导体ETF(512480)、人工智能ETF(515070)等。注意设置止盈线，建议达到30%收益时分批止盈。`;
      } else if (validMarketCondition === "震荡市") {
        // 震荡市：70%进攻 + 30%红利作为安全垫
        strategy = "无限进攻·震荡市策略：70%进攻 + 30%红利安全垫";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.创业板ETF.name,
            code: ETF_DATABASE.创业板ETF.code,
            reason: "成长板块，波段操作机会多",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.3).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.半导体ETF.name,
            code: ETF_DATABASE.半导体ETF.code,
            reason: "科技主题弹性大，震荡市有波段机会",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.25).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.人工智能ETF.name,
            code: ETF_DATABASE.人工智能ETF.code,
            reason: "AI主题长期成长逻辑不变",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.15).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.红利ETF.name,
            code: ETF_DATABASE.红利ETF.code,
            reason: "高股息策略，作为安全垫降低波动",
            riskLevel: "中低",
            suggestedAmount: `配置${(totalFund * 0.3).toFixed(0)}元`
          }
        ];
        stockPicks = [...STOCK_PICKS.牛市.科技.slice(0, 2)];
        tacticalAdvice = `震荡市保持进攻姿态，70%配置高弹性标的，30%配置红利ETF作为安全垫。可以利用波动进行波段操作，低吸高抛。`;
      } else {
        // 熊市：40%进攻（抄底）+ 60%黄金和国债防守
        strategy = "无限进攻·熊市策略：40%进攻抄底 + 60%黄金国债防守";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.创业板ETF.name,
            code: ETF_DATABASE.创业板ETF.code,
            reason: "超跌成长板块，熊市抄底机会",
            riskLevel: "高",
            suggestedAmount: `每月定投${Math.min(totalFund * 0.15, 1000).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.科创50ETF.name,
            code: ETF_DATABASE.科创50ETF.code,
            reason: "硬科技超跌，长期布局机会",
            riskLevel: "高",
            suggestedAmount: `每月定投${Math.min(totalFund * 0.15, 1000).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.半导体ETF.name,
            code: ETF_DATABASE.半导体ETF.code,
            reason: "科技超跌，弹性大适合抄底",
            riskLevel: "高",
            suggestedAmount: `每月定投${Math.min(totalFund * 0.1, 800).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.黄金ETF.name,
            code: ETF_DATABASE.黄金ETF.code,
            reason: "黄金作为避险资产，熊市保值",
            riskLevel: "中",
            suggestedAmount: `配置${(totalFund * 0.3).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.国债ETF.name,
            code: ETF_DATABASE.国债ETF.code,
            reason: "国债提供安全收益，降低组合风险",
            riskLevel: "低",
            suggestedAmount: `配置${(totalFund * 0.3).toFixed(0)}元`
          }
        ];
        stockPicks = STOCK_PICKS.熊市.超跌;
        tacticalAdvice = `熊市中保持40%进攻仓位抄底超跌成长板块，60%配置黄金和国债防守。采用定投方式分批建仓，等待市场反弹。不要一次性抄底，要预留现金。`;
      }
    } else {
      // 防守反击风格：固定配置50%低波红利防守 + 50%弹性标的进攻
      if (validMarketCondition === "牛市") {
        // 牛市：50%低波红利 + 50%证券/科技进攻
        strategy = "防守反击·牛市策略：50%低波红利防守 + 50%证券科技进攻";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.低波红利ETF.name,
            code: ETF_DATABASE.低波红利ETF.code,
            reason: "低波动策略，牛市中稳健防守",
            riskLevel: "低",
            suggestedAmount: `配置${(totalFund * 0.5).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.证券ETF.name,
            code: ETF_DATABASE.证券ETF.code,
            reason: "券商牛市先锋，进攻端配置",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.25).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.人工智能ETF.name,
            code: ETF_DATABASE.人工智能ETF.code,
            reason: "AI主题成长性强，进攻配置",
            riskLevel: "高",
            suggestedAmount: `配置${(totalFund * 0.25).toFixed(0)}元`
          }
        ];
        stockPicks = STOCK_PICKS.牛市.券商.slice(0, 2);
        tacticalAdvice = `牛市采用防守反击策略，50%低波红利ETF(563280)防守，50%证券ETF(512880)和AI ETF(515070)进攻。攻守兼备，风险可控。`;
      } else if (validMarketCondition === "震荡市") {
        // 震荡市：50%低波红利 + 50%价值/消费
        strategy = "防守反击·震荡市策略：50%低波红利防守 + 50%价值消费进攻";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.低波红利ETF.name,
            code: ETF_DATABASE.低波红利ETF.code,
            reason: "低波动策略，震荡市防守核心",
            riskLevel: "低",
            suggestedAmount: `配置${(totalFund * 0.5).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.价值ETF.name,
            code: ETF_DATABASE.价值ETF.code,
            reason: "价值策略在震荡市中表现稳健",
            riskLevel: "中",
            suggestedAmount: `配置${(totalFund * 0.3).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.中证医药ETF.name,
            code: ETF_DATABASE.中证医药ETF.code,
            reason: "医药消费长期成长，震荡市防守配置",
            riskLevel: "中",
            suggestedAmount: `配置${(totalFund * 0.2).toFixed(0)}元`
          }
        ];
        stockPicks = [...STOCK_PICKS.震荡市.高股息, ...STOCK_PICKS.震荡市.防御];
        tacticalAdvice = `震荡市采用防守反击，50%低波红利ETF(563280)防守，50%价值ETF(159510)和医药ETF(512010)进攻。获取股息收益的同时等待市场机会。`;
      } else {
        // 熊市：50%低波红利 + 50%沪深300定投
        strategy = "防守反击·熊市策略：50%低波红利防守 + 50%沪深300定投";
        recommendedProducts = [
          {
            type: 'ETF',
            name: ETF_DATABASE.低波红利ETF.name,
            code: ETF_DATABASE.低波红利ETF.code,
            reason: "低波动策略，熊市防守核心",
            riskLevel: "低",
            suggestedAmount: `配置${(totalFund * 0.5).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.沪深300ETF.name,
            code: ETF_DATABASE.沪深300ETF.code,
            reason: "核心蓝筹估值低，熊市定投布局",
            riskLevel: "中",
            suggestedAmount: `每月定投${Math.min(totalFund * 0.25, 1500).toFixed(0)}元`
          },
          {
            type: 'ETF',
            name: ETF_DATABASE.红利ETF.name,
            code: ETF_DATABASE.红利ETF.code,
            reason: "高股息策略提供持续现金流",
            riskLevel: "中低",
            suggestedAmount: `每月定投${Math.min(totalFund * 0.25, 1500).toFixed(0)}元`
          }
        ];
        stockPicks = STOCK_PICKS.震荡市.高股息;
        tacticalAdvice = `熊市采用防守反击策略，50%低波红利ETF(563280)防守获取股息，50%沪深300ETF(510300)定投布局核心资产。攻守兼备，等待市场复苏。`;
      }
    }

    setRecommendation({
      strategy,
      marketCondition: validMarketCondition,
      knowledgeLevel: validKnowledgeLevel,
      recommendedProducts,
      stockPicks,
      riskWarning,
      tacticalAdvice,
      knowledgeAssessment
    });
  };

  const handleQuizAnswer = (questionId: number, answerIndex: number, isCorrect: boolean) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionId - 1] = isCorrect ? 1 : 0;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (quizAnswers.length < KNOWLEDGE_QUESTIONS.length) {
      alert("请完成所有问题后再继续");
      return;
    }
    generateRecommendation();
    setStep(5);
    // 滚动到页面顶部以显示结果
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">学生投资顾问</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-700">欢迎，{user.username}</span>
                  <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    进入仪表板
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                    登录
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            学生智能投资顾问
          </h1>
          <p className="text-lg text-gray-600">
            根据市场环境和投资水平，推荐具体投资产品
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-all ${
                  i <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          {/* 市场环境指示器 */}
          {!loadingMarket && marketData && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              marketData.condition === '牛市' ? 'bg-red-50 text-red-700' :
              marketData.condition === '熊市' ? 'bg-green-50 text-green-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              <span className="font-semibold">{marketData.condition}</span>
              <span className="text-sm">·</span>
              <span className="text-sm">沪深300近半年{marketData.threeMonthChange >= 0 ? '+' : ''}{marketData.threeMonthChange}%</span>
            </div>
          )}
        </div>

        {/* 步骤内容 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 步骤1：球队目标 */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">欢迎来到足球世界！</h2>
                <p className="text-gray-600">作为球队经理，你的首要目标是什么？</p>
              </div>
              <div className="space-y-4">
                {(["短期冲冠", "长期豪门", "运营维稳"] as InvestmentGoal[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setGoal(option); setStep(2); }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      goal === option ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <span className="text-2xl">⚽</span>
                      {option}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {option === "短期冲冠" && "1-2年内快速打造冠军阵容，不惜代价争取荣誉"}
                      {option === "长期豪门" && "3-5年建立王朝基业，培养青训天才，打造百年俱乐部"}
                      {option === "运营维稳" && "稳健经营，可持续发展，确保球队长期生存和稳定收益"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 步骤2：踢球风格 */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">选择你的战术风格</h2>
                <p className="text-gray-600">不同的战术风格决定球队的投资策略</p>
              </div>
              <div className="space-y-4">
                {(["无限进攻", "防守反击"] as RiskTolerance[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setRiskTolerance(option); setStep(3); }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      riskTolerance === option ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <span className="text-2xl">{option === "无限进攻" ? "🔥" : "🛡️"}</span>
                      {option === "无限进攻" ? "4-3-3 全攻全守" : "4-2-3-1 防守反击"}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {option === "无限进攻" && "高位逼抢，疯狂进攻！配置证券、科技、AI、创新药等高弹性进攻型资产，追求最大化收益"}
                      {option === "防守反击" && "稳固后腰，快速反击！半仓配置红利资产防守，半仓配置弹性标的捕捉机会，攻守兼备"}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-6 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤3：球队预算 */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">最后一步：球队预算</h2>
                <p className="text-gray-600">选择预算后即可查看你的战术板！</p>
              </div>
              <div className="space-y-4">
                {(["5000以下", "5000-20000", "20000以上"] as FundLevel[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFundLevel(option);
                      // 跳过知识测试，直接生成推荐
                      setTimeout(() => {
                        generateRecommendation();
                        setStep(5);
                        // 滚动到页面顶部以显示结果
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }, 100);
                    }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      fundLevel === option ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      {option === "5000以下" ? "青训营预算" : option === "5000-20000" ? "中游球队预算" : "豪门预算"}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {option === "5000以下" && `5000元以下 - 适合小额基金定投，从年轻球员（ETF）开始培养`}
                      {option === "5000-20000" && `5000-20000元 - 可以配置主力球员（ETF）+ 球星（精选股票）`}
                      {option === "20000以上" && `20000元以上 - 可以打造豪华阵容，构建多产品投资组合`}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-6 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤4：球探知识测试 */}
          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">球探知识测试</h2>
                <p className="text-gray-600">
                  测试你的足球知识，展示你的球探水平
                </p>
              </div>
              <div className="space-y-6">
                {KNOWLEDGE_QUESTIONS.map((q, index) => (
                  <div key={q.id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {q.id}
                      </span>
                      <h3 className="font-semibold text-gray-800">{q.question}</h3>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            onChange={() => handleQuizAnswer(q.id, optIndex, option.correct)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-4"
                >
                  ⚽ 完成测试，查看战术板
                </button>
              </div>
              <button onClick={() => setStep(3)} className="mt-4 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤5：战术板 */}
          {step === 5 && recommendation && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <span className="text-4xl">🏆</span>
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2">
                  当前联赛形势：{recommendation.marketCondition}（沪深300近半年{(marketData?.threeMonthChange || 0) >= 0 ? '+' : ''}{(marketData?.threeMonthChange || 0)}%）
                </div>
                <div className="text-sm text-purple-600 font-medium mb-2">
                  你的球探水平：{recommendation.knowledgeLevel}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  ⚽ {recommendation.strategy}
                </h2>
                <p className="text-gray-600 mt-2">根据你的选择制定的球队建设方案</p>
              </div>

              {/* 大学生投资者特别提示 */}
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🎓</span>
                  <div className="flex-1">
                    <div className="font-bold text-red-800 mb-2 text-base">大学生新经理特别提示</div>
                    <div className="text-sm text-red-700 leading-relaxed space-y-2">
                      <p>
                        <strong>切勿盲目购买券商APP、支付宝理财、京东金融等平台推荐的基金理财产品！</strong>
                      </p>
                      <p>
                        这些平台推荐的产品往往销售费用高、业绩跟踪差，且可能不适合您的投资目标和风险承受能力。
                      </p>
                      <p className="font-semibold text-red-800">
                        就像做球探要亲自考察球员一样，入市前请务必做足功课：
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>学习基础知识：了解ETF、股票、基金的区别，就像了解不同位置的球员特点</li>
                        <li>研究产品特性：查看费率、历史业绩、投资策略，就像考察球员的技术特点和过往表现</li>
                        <li>了解市场环境：关注大盘走势、行业景气度，就像关注联赛形势和球队状态</li>
                        <li>制定投资计划：明确目标和止盈止损策略，就像制定赛季目标和轮换策略</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 球探评估反馈 */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <div className="font-semibold text-blue-800">球探评估报告</div>
                    <div className="text-sm text-blue-700">{recommendation.knowledgeAssessment}</div>
                  </div>
                </div>
              </div>

              {/* 推荐球员列表 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">⭐ 推荐签约球员（投资标的）</h3>
                <div className="space-y-3">
                  {recommendation.recommendedProducts.map((product, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              product.type === 'ETF' ? 'bg-blue-100 text-blue-700' :
                              product.type === '股票' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {product.type}
                            </span>
                            <span className="font-semibold text-gray-800">{product.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{product.code}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              product.riskLevel === "高" ? "bg-red-100 text-red-700" :
                              product.riskLevel === "中高" ? "bg-orange-100 text-orange-700" :
                              product.riskLevel === "中" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {product.riskLevel}风险
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{product.reason}</div>
                          <div className="text-sm font-medium text-blue-600">{product.suggestedAmount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 球星推荐（仅进阶和专业水平显示） */}
              {recommendation.stockPicks.length > 0 && !["新手", "入门"].includes(recommendation.knowledgeLevel) && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">🌟 精选球星推荐</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendation.stockPicks.map((stock, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-1">{stock.name}</div>
                            <div className="text-xs text-gray-500 mb-1">{stock.code}</div>
                            <div className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded inline-block">{stock.sector}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">{stock.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 战术指导 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📋 战术指导
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {recommendation.tacticalAdvice}
                </p>
              </div>

              {/* 风险提示 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-semibold text-yellow-800 mb-1">转会风险提示</div>
                    <div className="text-sm text-yellow-700">{recommendation.riskWarning}</div>
                  </div>
                </div>
              </div>

              {/* 免责声明 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
                <strong>重要声明：</strong>以上产品均为真实可交易的ETF/股票，投资建议仅供参考。历史业绩不代表未来表现，投资有风险，入市需谨慎。建议在投资前充分了解产品特性并根据自身情况做出决策。
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setGoal("");
                  setRiskTolerance("");
                  setFundLevel("");
                  setKnowledgeLevel("");
                  setQuizAnswers([]);
                  setRecommendation(null);
                }}
                className="w-full mt-6 bg-gray-800 text-white py-4 rounded-xl font-semibold hover:bg-gray-900 transition-colors"
              >
                重新评估
              </button>
            </div>
          )}
        </div>

        {/* 免责声明 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          ⚠️ 本工具仅供参考，不构成投资建议。投资有风险，入市需谨慎。
        </div>

        {/* 注册提示 */}
        {!user && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-blue-800 mb-2">
              注册账户，解锁更多功能
            </h3>
            <p className="text-blue-700 mb-4">
              创建账户后可以保存投资偏好，与其他用户交流投资心得
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                立即注册
              </Link>
              <Link href="/login" className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50">
                登录
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
