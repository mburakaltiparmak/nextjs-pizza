import { Separator } from "../ui/separator";

export const AdminSidebarItem = ({ item, collapsed, isMobile, mobileOpen, activePage, navigateTo, isNavigating }) => {
    return (
        <li className="space-y-1 w-full" key={item.id}>
            <button
                onClick={() => navigateTo(item.path)}
                disabled={isNavigating}
                className={`flex flex-row gap-1 items-center justify-start rounded-xl p-3  w-full ${activePage === item.id
                    ? "bg-yellow text-black"
                    : "text-white hover:bg-yellow hover:text-black"
                    } border border-red font-medium ${isNavigating ? "opacity-70 cursor-not-allowed" : ""
                    }`}
            >
                <span>
                     {/* Icon needs to be cloned or rendered with specific classes if passed as element, 
                         but here we assume item.icon is an element. In AdminSidebar it's defined as JSX with classes.
                         We should probably pass the Icon Component instead to control classes here, 
                         OR keep passing the element if it already has dynamic classes.
                         Looking at AdminSidebar, the icon has classes based on 'collapsed'.
                         So it's better if we pass the Icon Component and handle classes here.
                      */}
                    {item.icon}
                </span>
                {(!collapsed || (isMobile && mobileOpen)) && (
                    <span>{item.name}</span>
                )}
            </button>
            <Separator orientation="horizontal" />
        </li>
    );
};
