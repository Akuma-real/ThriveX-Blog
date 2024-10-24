"use client"

import { useEffect, useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import directory from '@/assets/svg/other/directory.svg'

import "./index.scss";

interface NavItem {
    href: string;
    start: number;
    end?: number;
    className: string;
}

// 定义距离视口顶部多少像素时高亮导航项
const OFFSET = 100;

const ContentNav = () => {
    const [open, setOpen] = useState(false);
    const [navs, setNavs] = useState<NavItem[]>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {        
        // 获取当前容器中所有的标题
        const list = document.querySelectorAll(".content h1, .content h2, .content h3");

        list?.forEach((nav) => {
            nav.setAttribute("id", nav.textContent!)

            switch (nav.tagName) {
                case "H1":
                    nav.setAttribute("class", "h1")
                    break;
                case "H2":
                    nav.setAttribute("class", "h2")
                    break;
                case "H3":
                    nav.setAttribute("class", "h3")
                    break;
            }
        });

        // 给每个标题设置一个视口顶部的距离
        const titles = Array.from(list)?.map(t => {
            const top = t.getBoundingClientRect().top + window.scrollY;
            return { href: t.textContent!, top, className: t.className };
        });

        // 设置起始距离和结束距离
        const titlesList: NavItem[] = titles?.map((title, index) => ({
            href: title.href,
            start: title.top,
            end: index < titles.length - 1 ? titles[index + 1].top : Infinity,
            className: title.className
        }));

        setNavs(titlesList);

        // 页面滚动到指定位置高亮导航项
        const handleScroll = () => {
            const top = window.scrollY + OFFSET;
            setActive(top);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            {open
                ? (
                    <div className="fixed bottom-5 right-5 sm:top-[80%] sm:left-[320px] z-50 cursor-pointer flex justify-center items-center w-12 h-12 rounded-xl bg-white p-3 border" onClick={() => setOpen(false)}>
                        <MdOutlineKeyboardDoubleArrowLeft className="w-full text-4xl text-primary" />
                    </div>
                )
                : (
                    !!navs?.length &&
                    <div className="fixed top-[80%] left-[2%] z-50 cursor-pointer w-12 h-12 rounded-xl bg-white p-3 border" onClick={() => setOpen(true)}>
                        <img src={directory.src} alt="" className="w-full text-5xl text-primary" />
                    </div >
                )
            }

            <div className={`ContentNavComponent overflow-hidden fixed top-0 z-40 max-w-0 h-screen bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(30,36,46,0.9)] backdrop-blur-sm shadow-[16px_0px_15px_-3px_rgba(101,155,246,0.1)] ${open ? 'max-w-[300px] p-[20px_10px]' : 'max-w-0'} transition-[max-width]`}>
                <div className="flex justify-center items-center mt-5">
                    <img src={directory.src} alt="" className="w-5 mr-2" /> 目录
                </div>

                <div className="text-[#4d4d4d] dark:text-[#8c9ab1] text-sm w-full mt-4">
                    {navs?.map((item, index) => (
                        <a
                            key={index}
                            href={`#${item.href}`}
                            className={`nav_item overflow-hidden relative block p-1 pl-5 mb-[5px] hover:text-primary transition-all duration-700 ${active >= item.start && active < item.end! ? 'text-primary pl-[30px] rounded-[10px] text-[15px] dark:bg-[#313d4e99] before:!left-4' : ''} ${item.className}`}
                        >
                            {item.href}
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ContentNav;