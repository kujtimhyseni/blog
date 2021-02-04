const drawerWidth = 240;

export const styles = (theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        backgroundColor: "#343A40",
        height: "50px",
        '& .MuiToolbar-regular': {
            minHeight: "50px"
        },
        zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        paddingTop: "50px",
        width: drawerWidth,
    },
    drawerContainer: {
        overflow: 'auto',
    },
    content: {
        paddingTop: "50px",
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    name: {
        marginLeft: "15px",
        marginRight: "15px"
    },
    link: {
        textTransform: "unset",
        color: "#a5a5a5",
        margin: "0 20px",
        textDecoration: "unset"
    },
    form: {
         marginLeft: "0px",
         background: "linear-gradient(to right bottom, #FFFFFF, #D0D0D0)",
         height: "100%"
    },
    border: {
        marginLeft: "10px",
        border: "2px gray",
      
        
   },
    textField: {
        margin: "15px",
        width : "800px",
    },
    search: {
        marginTop: "15px",
    },
    detail: {
        marginRight: "5px 0"
    },
    edit: {
        backgroundColor: "orange",
        border: "4px solid orange",
        borderRadius: "5px",
        textDecoration: "none",
        fontSize: "23px",
        fontWeight: "bold",
        color: "white"
    },
    publish: {
        backgroundColor: "#0062cc",
        "&:hover": {
            backgroundColor: "#0062cc",
            opacity: 0.8
        }
    },
    delete: {
        backgroundColor: "#DD4145",
        "&:hover": {
            backgroundColor: "#DD4145",
            opacity: 0.8
        }
    },
    update: {
        backgroundColor: "#64A845",
        "&:hover": {
            backgroundColor: "#64A845",
            opacity: 0.8
        }
    },
    buttonWrapper: {
        marginTop: "20px"
    },
    button: {
        marginRight: "15px",
        color: "white",
        fontSize: "13px",
        textTransform: "none",
        height: "25px"
    },
    removeAll: {
        marginTop: "20px"
    },
    blog: {
        marginLeft: "25px"
    },
    ListItemTile: {
        overflow: "hidden",
        padding: "5px",
        textOverflow : "ellipsis"
    },
    BlogComment:{
        padding:"10px",
        border: "1px solid black",
        paddingBottom: "14px",
    },
    AddComment:{
        padding:"10px",
        border: "1px solid grey",
        paddingBottom: "14px",
        marginTop:"100px",
        marginRight:"20px"
    },
    red: {
        color: "red",
        marginLeft: "15px",
    },
    submitButton: {
        marginTop: "15px",
        color: "primary",
        fontSize: "13px",
        textTransform: "none",
        height: "25px",
        width: "880px"
    },
    searchButton: {
        margin: "15px",
        color: "primary",
        fontSize: "15px",
        textTransform: "none",
    },
    searchBarDiv: {
        margin: "0px",
        backgroundColor: "#FBFBF9"
    },
    sidebar: {
        margin: "0px",
        backgroundColor: "#F4E2FC",
        minHeight: "100%"
    },
});
