const Page = ({params}) => {
    console.log("params",params.id);

    return (
        <div>
            <span>
                Params : {params.id}
            </span>
        </div>
    )

}
export default Page;