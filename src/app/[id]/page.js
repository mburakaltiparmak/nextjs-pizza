import Footer from "@/components/footer";
import Header from "@/components/header";

const Page = ({params}) => {
    console.log("params",params.id);

    return (
        <div>
            <Header />
            <span>
                Params : {params.id}
            </span>
            <Footer />
        </div>
    )

}
export default Page;