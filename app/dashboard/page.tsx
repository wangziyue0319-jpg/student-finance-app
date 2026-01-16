"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 投资目标类型
type InvestmentGoal = "短期储蓄" | "中期增值" | "长期投资";

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
    question: "什么是ETF（交易型开放式指数基金）？",
    options: [
      { text: "像股票一样在交易所交易，跟踪特定指数的基金", correct: true },
      { text: "只能在银行购买的封闭式基金", correct: false },
      { text: "由基金经理主动选股的基金", correct: false },
      { text: "只能在特定时间开放的基金", correct: false }
    ]
  },
  {
    id: 2,
    question: "以下哪种投资方式风险最高？",
    options: [
      { text: "购买国债", correct: false },
      { text: "购买货币基金", correct: false },
      { text: "购买期货或进行杠杆交易", correct: true },
      { text: "购买银行理财", correct: false }
    ]
  },
  {
    id: 3,
    question: "市盈率（PE）的含义是什么？",
    options: [
      { text: "公司总市值除以净利润", correct: true },
      { text: "股价除以每股收益", correct: false },
      { text: "交易量除以流通股本", correct: false },
      { text: "净资产除以总股本", correct: false }
    ]
  },
  {
    id: 4,
    question: "以下哪个不是A股市场的交易时间？",
    options: [
      { text: "周一至周五 9:30-11:30, 13:00-15:00", correct: false },
      { text: "周六日 9:30-15:00", correct: true },
      { text: "法定节假日除外", correct: false },
      { text: "早盘9:15-9:25是集合竞价时间", correct: false }
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

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
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

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

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

    // 保存用户投资偏好
    updateUser({
      investmentProfile: { goal, riskTolerance, fundLevel, marketCondition }
    });

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                学生投资顾问
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  投资建议
                </Link>
                <Link href="/friends" className="text-gray-700 hover:text-blue-600 font-medium">
                  好友
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium">
                  消息
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
                  个人主页
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            欢迎回来，{user.username}！
          </h1>
          <p className="text-lg text-gray-600">
            根据市场环境和投资水平，推荐具体投资产品
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
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
          {/* 步骤1：投资目标 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                你的投资目标是什么？
              </h2>
              <div className="space-y-4">
                {(["短期储蓄", "中期增值", "长期投资"] as InvestmentGoal[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setGoal(option); setStep(2); }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      goal === option ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2">{option}</div>
                    <div className="text-gray-600 text-sm">
                      {option === "短期储蓄" && "1-2年内可能需要使用资金，追求稳健收益"}
                      {option === "中期增值" && "3-5年内寻求资产增值，可承受一定波动"}
                      {option === "长期投资" && "5年以上投资期限，追求长期复利增长"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 步骤2：投资风格 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                你更倾向于哪种投资风格？
              </h2>
              <div className="space-y-4">
                {(["无限进攻", "防守反击"] as RiskTolerance[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setRiskTolerance(option); setStep(3); }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      riskTolerance === option ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2">{option}</div>
                    <div className="text-gray-600 text-sm">
                      {option === "无限进攻" && "追求高收益，配置高弹性标的如证券、科技、人工智能、创新药等进攻型资产"}
                      {option === "防守反击" && "稳健为主，半仓配置低波红利防守，半仓配置弹性标的捕捉机会"}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="mt-6 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤3：资金规模 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                你的可投资资金规模是多少？
              </h2>
              <div className="space-y-4">
                {(["5000以下", "5000-20000", "20000以上"] as FundLevel[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setFundLevel(option); setStep(4); }}
                    className={`w-full p-6 text-left rounded-xl border-2 transition-all ${
                      fundLevel === option ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2">{option}元</div>
                    <div className="text-gray-600 text-sm">
                      {option === "5000以下" && "适合进行小额基金定投"}
                      {option === "5000-20000" && "可以配置ETF + 精选股票"}
                      {option === "20000以上" && "可以构建多产品投资组合"}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-6 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤4：证券市场知识测试 */}
          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">证券市场知识测试</h2>
                <p className="text-gray-600">
                  根据答题结果调整推荐策略的激进程度
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
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-4"
                >
                  提交并查看推荐
                </button>
              </div>
              <button onClick={() => setStep(3)} className="mt-4 text-gray-600 hover:text-gray-800">← 返回上一步</button>
            </div>
          )}

          {/* 步骤5：推荐结果 */}
          {step === 5 && recommendation && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2">
                  当前市场：{recommendation.marketCondition}（沪深300近半年{(marketData?.threeMonthChange || 0) >= 0 ? '+' : ''}{(marketData?.threeMonthChange || 0)}%）
                </div>
                <div className="text-sm text-purple-600 font-medium mb-2">
                  你的水平：{recommendation.knowledgeLevel}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {recommendation.strategy}
                </h2>
              </div>

              {/* 大学生投资者特别提示 */}
              <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <div className="font-bold text-red-800 mb-2 text-base">🎓 大学生投资者特别提示</div>
                    <div className="text-sm text-red-700 leading-relaxed space-y-2">
                      <p>
                        <strong>切勿盲目购买券商APP、支付宝理财、京东金融等平台推荐的基金理财产品！</strong>
                      </p>
                      <p>
                        这些平台推荐的产品往往销售费用高、业绩跟踪差，且可能不适合您的投资目标和风险承受能力。
                      </p>
                      <p className="font-semibold text-red-800">
                        入市前请务必做足功课：
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                        <li>学习基础投资知识：了解ETF、股票、基金的基本区别</li>
                        <li>研究产品特性：查看费率、历史业绩、投资策略</li>
                        <li>了解市场环境：关注大盘走势、行业景气度</li>
                        <li>制定投资计划：明确自己的投资目标和止盈止损策略</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 知识评估反馈 */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1m1-4h1" />
                  </svg>
                  <div>
                    <div className="font-semibold text-blue-800">知识评估</div>
                    <div className="text-sm text-blue-700">{recommendation.knowledgeAssessment}</div>
                  </div>
                </div>
              </div>

              {/* 推荐产品列表 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">💎 具体产品推荐</h3>
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

              {/* 个股推荐（仅进阶和专业水平显示） */}
              {recommendation.stockPicks.length > 0 && !["新手", "入门"].includes(recommendation.knowledgeLevel) && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 精选个股推荐</h3>
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

              {/* 操作建议 */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  💡 操作建议
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {recommendation.tacticalAdvice}
                </p>
              </div>

              {/* 风险提示 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-yellow-800 mb-1">风险提示</div>
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
      </div>
    </div>
  );
}
