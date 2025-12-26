// client/src/components/LoadingAnimation.jsx
import loadingGif from "../assets/loading.gif";

const LoadingAnimation = () => {
    return (
        <div
        //     style={{
        //     display: "flex",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     padding: "20px",
        //     width: "100%"
        // }}
        >
            <img
                src={loadingGif}
                alt="Loading..."
                style={{ width: "75px", height: "75px" }} // Boyutu isteğine göre ayarla
            />
        </div>
    );
};

export default LoadingAnimation;
