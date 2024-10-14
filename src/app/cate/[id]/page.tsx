import { getCateArticleListAPI } from "@/api/cate";
import Starry from "@/components/Starry"
import Swiper from "@/components/Swiper"
import Classics from "@/components/ArticleLayout/Classics";
import Pagination from "@/components/Pagination";

interface Props {
  params: { id: number };
  searchParams: { page: number; name: string };
};

export default async ({ params, searchParams }: Props) => {
  const id = params.id;
  const page = searchParams.page || 1;
  const name = searchParams.name;

  const { data } = await getCateArticleListAPI(id, page)

  return (
    <>
      <title>{`${name} - 分类`}</title>
      <meta name="description" content={name} />

      <div>
        <Swiper isRipple={false}>
          {/* 星空背景组件 */}
          <Starry />

          {/* 分类信息 */}
          <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[80%] text-center text-white text-[20px] xs:text-[25px] sm:text-[30px] custom_text_shadow">
            <span>{name} ~ 共计{data?.total}篇文章</span>
          </div>
        </Swiper>

        <div className="md:w-full lg:w-[900px] lg:mx-auto px-4 lg:p-0 mt-10">
          <Classics data={data} />

          <Pagination total={data?.pages} page={page} url={`?name=${name}&page=${page}`} className="flex justify-center mt-5" />
        </div>
      </div>
    </>
  )
}