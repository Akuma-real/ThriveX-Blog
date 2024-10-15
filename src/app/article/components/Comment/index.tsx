"use client"

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { addCommentDataAPI, getArticleCommentListAPI } from '@/api/comment';
import { sendCommentEmailAPI } from '@/api/email';
import { Comment } from '@/types/app/comment';
import { ToastContainer, toast } from 'react-toastify';
import List from './Component/List';
import 'react-toastify/dist/ReactToastify.css';
import "./index.scss"
import dayjs from 'dayjs';

interface Props {
    articleId: number,
    articleTitle: string
}

interface CommentForm {
    content: string,
    name: string,
    email: string,
    url: string,
    avatar: string
}

const CommentForm = ({ articleId, articleTitle }: Props) => {
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [commentId, setCommentId] = useState(articleId);
    const [placeholder, setPlaceholder] = useState("来发一针见血的评论吧~");

    const [list, setList] = useState<Comment[]>([])
    const getCommentList = async () => {
        const { data } = await getArticleCommentListAPI(+articleId!);
        setList(data?.result)
    }

    useEffect(() => {
        getCommentList()
    }, [])

    const { register, control, formState: { errors }, handleSubmit, reset, setValue } = useForm<CommentForm>({});

    // 如果之前评论过，就从本地取数据，不需要再重新填写
    useEffect(() => {
        const info = JSON.parse(localStorage.getItem("comment_data") || '{}');
        setValue('name', info.name || '');
        setValue('email', info.email || '');
        setValue('avatar', info.avatar || '');
        setValue('url', info.url || '');
    }, [setValue]);

    const onSubmit = async (data: CommentForm) => {
        // 判断是不是QQ邮箱，如果是就把QQ截取出来，然后用QQ当做头像
        const email_index = data.email.lastIndexOf("@qq.com")
        if (email_index !== -1) {
            const qq = data.email.substring(0, email_index)

            // 判断是否是纯数字的QQ
            if (!isNaN(+qq)) data.avatar = `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`
        };

        const { code, message } = await addCommentDataAPI({ ...data, articleId, commentId: commentId === articleId ? 0 : commentId, createTime: Date.now().toString() })
        if (code !== 200) return alert("发布评论失败：" + message);

        toast("🎉 提交成功, 请等待审核!")

        // 发布成功后初始化表单
        setCommentId(articleId)
        setValue('content', "");
        setPlaceholder("来发一针见血的评论吧~");
        getCommentList()

        // 提交成功后把评论的数据持久化到本地
        localStorage.setItem("comment_data", JSON.stringify(data))

        // 发送邮件通知
        await sendCommentEmailAPI({
            content: data.content,
            reviewers: data.name,
            subject: articleTitle,
            title: articleTitle,
            url: location.href,
            time: dayjs(Date.now()).format('YYYY年MM月DD日 HH:mm')
        })
    };

    // 回复评论
    const replyComment = (id: number, name: string) => {
        contentRef.current?.focus();
        setCommentId(id);
        setPlaceholder(`回复评论给：${name}`);
        handleSubmit(onSubmit)
    }

    return (
        <div className='CommentComponent'>
            <div className="mt-[70px]">
                <div className="title relative top-0 left-0 w-full h-[1px] mb-10 bg-[#f7f7f7] dark:bg-black-b transition-colors"></div>

                <form className="flex flex-wrap justify-between mt-4 space-y-2 text-xs xs:text-sm" onSubmit={handleSubmit(onSubmit)}>
                    <div className='w-full'>
                        <textarea
                            {...register("content", { required: "请输入内容" })}
                            placeholder={placeholder}
                            className="tw_form w-full p-4 min-h-36"
                            ref={(e) => {
                                register("content").ref(e);
                                (contentRef as any).current = e;
                            }}
                        />
                        <span className='text-red-400 text-sm pl-3'>{errors.content?.message}</span>
                    </div>

                    <div className='flex flex-col w-[32%]'>
                        <input type="text" className="tw_form w-full h-9 pl-4" placeholder="你的名称" {...register("name", { required: "请输入名称" })} />
                        <span className='text-red-400 text-sm pl-3 mt-1'>{errors.name?.message}</span>
                    </div>

                    <div className='flex flex-col w-[32%]'>
                        <input type="text" className="tw_form w-full h-9 pl-4" placeholder="你的邮箱（选填）" {...register("email", { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "请输入正确的邮箱" } })} />
                        <span className='text-red-400 text-sm pl-3 mt-1'>{errors.email?.message}</span>
                    </div>

                    <div className='flex flex-col w-[32%]'>
                        <input type="text" className="tw_form w-full h-9 pl-4" placeholder="头像（选填）" {...register("avatar", { pattern: { value: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/, message: "请输入正确的头像链接" } })} />
                        <span className='text-red-400 text-sm pl-3 mt-1'>{errors.avatar?.message}</span>
                    </div>

                    <div className='w-full flex flex-col'>
                        <input type="text" className="tw_form w-full h-9 pl-4" placeholder="你的站点（选填）"  {...register("url", { pattern: { value: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/, message: "请输入正确的网站链接" } })} />
                        <span className='text-red-400 text-sm pl-3 mt-1'>{errors.url?.message}</span>
                    </div>

                    <button className="w-full h-10 !mt-4 text-white rounded-md bg-primary text-center" type="submit">发表评论</button>
                </form>

                <List id={articleId} list={list} reply={replyComment} />
            </div>

            <ToastContainer />
        </div>
    );
};

export default CommentForm;