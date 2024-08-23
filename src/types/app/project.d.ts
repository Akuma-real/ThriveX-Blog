// 系统信息
export interface System {
    osName: string,
    osVersion: string,
    totalMemory: number,
    availableMemory: number,
    memoryUsage: number
}

export interface Social {
    name: string;
    url: string;
}

// 网站信息
export interface Web {
    url: string,
    title: string,
    subhead: string,
    favicon: string,
    lightLogo: string,
    darkLogo: string,
    description: string,
    keyword: string,
    footer: string,
    // font: string,
    social: string,
    covers: string
}

export type ArticleLayout = "classics" | "card" | "waterfall" | ""
export type RightSidebar = "author" | "hotArticle" | "randomArticle" | "newComments"

// 布局配置
export interface Layout {
    isArticleLayout: string,
    rightSidebar: string,
    swiperImage: string,
    swiperText: string
}