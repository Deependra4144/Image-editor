import '../assets/st.css'
import { useCallback, useEffect, useRef, useState } from "react";
import values from '../assets/ImgProp'
import QRCode from 'react-qr-code';

function Imageditior() {
    let ref = useRef(null)
    let vref = useRef(null)
    const [editImg, setEditImg] = useState('')
    const [showImgs, setshowImgs] = useState([])
    const [selectedOptionIndex, setselectedOptionIndex] = useState(0)
    const [options, setOptions] = useState([...values])
    const selectedOption = options[selectedOptionIndex]

    // let dimg = useRef(editImg)
    const canvasRef = useRef(null);

    // console.log(selectedOption)
    const handleInput = (e) => {
        let getImg = e.target.files[0];
        // console.log(getImg)
        if (getImg) {
            const reader = new FileReader();

            reader.readAsDataURL(getImg);
            reader.onload = () => {
                let url = reader.result
                // console.log(url)
                let arr = JSON.parse(localStorage.getItem('ImagesArray')) || [];
                arr.push(url)
                localStorage.setItem('ImagesArray', JSON.stringify(arr))
                setshowImgs([...arr])
            }
        }
    }

    const openCemara = () => {
        vref.current.style = 'display: block'
        ref.current.style = 'display: none'
        console.log(ref.current)
        navigator.mediaDevices.getUserMedia({
            video: true
            , audio: false
        }).then((stream) => {
            vref.current.srcObject = stream
            vref.current.play()


        })
    }
    const getVideoimg = useCallback(() => {
        let videoElement = vref.current
        let canva = canvasRef.current
        canva.width = videoElement.videoWidth;
        canva.height = videoElement.videoHeight;
        canva.getContext('2d').drawImage(videoElement, 0, 0, canva.width, canva.height)
        let img = canva.toDataURL('image/png')
        let arr = JSON.parse(localStorage.getItem('ImagesArray'))
        arr.push(img)
        localStorage.setItem('ImagesArray', JSON.stringify(arr))
        setEditImg(img)
        setshowImgs(JSON.parse(localStorage.getItem('ImagesArray')))
        vref.current.style = 'display: none'
        ref.current.style = 'display: block'
    }, [])
    const handleSetimg = (e) => {
        setEditImg(e.target.src)
    }
    const downloadImag = () => {
        if (!editImg) {
            alert('select the image')
            return ''
        } else {

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = editImg;

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.filter = options.map(option => `${option.property}(${option.value}${option.unit})`).join(' ');
                ctx.drawImage(img, 0, 0);

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'Edit by Deep.png';
                link.click();
            };
        }
    };

    const handleSliderChange = (e) => {
        setOptions(prev =>
            prev.map((option, index) => {

                if (index !== selectedOptionIndex) return option
                return { ...option, value: e.target.value }

            })
        )
    }

    function getImageStyle() {
        const filters = options.map(option => {
            return `${option.property}(${option.value}${option.unit})`
        })
        return { filter: filters.join(' ') }
    }


    const handleDeletImg = useCallback(() => {
        let arr = JSON.parse(localStorage.getItem('ImagesArray'))
        arr.pop()
        localStorage.setItem('ImagesArray', JSON.stringify(arr))
        setshowImgs(arr)
    }, [])
    useEffect(function () {
        setshowImgs([...JSON.parse(localStorage.getItem('ImagesArray')) || []])
    }, [getVideoimg, handleDeletImg])

    return (

        <div className="container h-100 shadow P-0 py-2 text-center">
            <div className="row d-flex p-0 gap-4 justify-content-center">
                <div className="col-md-4 col-sm-12">
                    <div className="d-flex flex-column flex-shrink-0 p-3 bg-light">
                        <p className="d-flex align-items-center mb-3 mb-md-0 me-md-auto">
                            <span className="fs-4">Sidebar</span>
                        </p>
                        <p className='text-start'>
                            <QRCode className='text-right' value='http://192.168.100.91:5173/' size={40} />
                        </p>
                        <hr />
                        <ul className="nav nav-pills flex-column mb-auto">
                            {options.map((e, i) => {
                                return (
                                    <li key={i} className="nav-item" onClick={() => { setselectedOptionIndex(i) }}>
                                        <span className='nav-link'>{e.name}</span>
                                    </li>

                                )
                            })}
                            <li>
                                <input
                                    type="range"
                                    min={selectedOption.range.min}
                                    max={selectedOption.range.max}
                                    value={selectedOption.value}
                                    onChange={handleSliderChange}
                                />
                            </li>
                            <li>
                                <div onClick={openCemara} className="btn btn-sm btn-outline-primary">Open Cemera</div>
                            </li>

                        </ul>
                    </div>
                </div>
                <div className="col-md-5 col-sm-12">
                    <div className="Image d-flex flex-column align-items-md-end align-items-sm-center gap-2 justify-content-center">
                        <video autoPlay ref={vref} className='border w-100' onClick={getVideoimg} style={{ display: 'none' }}></video>
                        <img
                            ref={ref}
                            src={editImg}
                            alt="select the image"
                            className="e-img img-thumbnail"
                            style={getImageStyle()}
                        />
                        <button className="btn btn-sm btn-outline-success" onClick={downloadImag}>Save</button>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    </div>
                </div>
            </div>
            <div className="">
                <input
                    className='my-2'
                    type="file"
                    accept="image/*"
                    onChange={handleInput}
                />
                <button className="btn btn-sm btn-outline-danger" onClick={handleDeletImg}>Delete Image</button>
                <div className="images py-3 d-flex justify-content-center gap-2" style={{ height: '200px' }}>
                    {
                        showImgs.map((e, i) => {
                            return (
                                <div key={i}>
                                    <img
                                        className="shadow rounded"
                                        key={i}
                                        src={e}
                                        style={{ width: '60px', height: '60px' }}
                                        onClick={handleSetimg}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default Imageditior