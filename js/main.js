
class PureCarousel {
    constructor({
        idCarousel,
        itemCarousel,
        slider,
        viewport
    }) {
        this.carousel = document.querySelector(idCarousel);
        this.items = this.carousel.querySelectorAll(itemCarousel);
        this.slider = this.carousel.querySelector(slider);
        this.viewport = this.carousel.querySelector(viewport)
        this.btnNext = this.carousel.querySelector(".btn-next");
        this.btnPrev = this.carousel.querySelector(".btn-prev");
        this.paginationBlock = this.carousel.querySelector(".carousel__pagination");
        this.totalWidth = 0;
        this.maxItemInView = 0;
        this.currentIndex = 0;
        this.oldSelectedIndex = null;
        this.arLeft = [];
        this.arRight = [];
        this.count = 0;
        this.velocity = 0.0005;
        this.pointerDown = false;
        this.sliderAttrTransform = 0;
        this.pointer = {
            x: 0,
            y: 0
        };
        this.init();
        this.events();
    }
    init() {
        this.setWidthSlider();
        this.getMaxItemInView();
        this.addPaginationDots();

        this.itemsRightSide();
        this.itemsLeftSide();

        this.setTransformMiddleItem();
        this.setTransformRightSideItem();
        this.setTransformLeftSideItem();

        this.activeItem();

    }
    getMaxItemInView() {
        const maxWidth = this.carousel.offsetWidth;
        this.maxItemInView = Math.round(maxWidth / this.getWitem(this.items[0]));
    }
    getWitem(item, withoutMargin = false) {
        let wItem = item.offsetWidth;
        let style = window.getComputedStyle(item, null);
        let marginRight = Number(style.getPropertyValue("margin-right").replace("px", ""));
        if (withoutMargin) {
            return [
                wItem,
                marginRight
            ];
        }
        else {
            return wItem + marginRight;
        }
    }
    setWidthSlider() {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            this.totalWidth += this.getWitem(item);
        }
        this.slider.style.width = `${this.totalWidth}px`;
    }
    itemsRightSide() {
        let indexMiddle = this.currentIndex;
        const totalItem = this.items.length;
        this.arRight = [];
        let maxItem = this.maxItemInView + 2;
        while (maxItem > 0) {
            indexMiddle++;
            if (indexMiddle > totalItem - 1) {
                indexMiddle = 0;
            }
            this.arRight.push(indexMiddle);
            maxItem--;
        };
    }
    itemsLeftSide() {
        let indexMiddle = this.currentIndex;
        const totalItem = this.items.length;
        this.arLeft = [];
        let maxItem = totalItem - this.maxItemInView - 2;
        while (maxItem > 0) {
            indexMiddle--;
            if (indexMiddle < 0) {
                indexMiddle = totalItem - 1;
            }
            this.arLeft.push(indexMiddle);
            maxItem--;
        };
    }
    setTransformMiddleItem() {
        let item = this.items[this.currentIndex];
        let style = window.getComputedStyle(item, null);
        let marginRight = Number(style.getPropertyValue("margin-right").replace("px", ""));
        item.style.position = "absolute";
        item.style.left = 0;
        item.style.transform = `translateX(${marginRight * 100 / this.totalWidth}%)`;
    }
    setTransformRightSideItem() {
        let transformX = 100;
        for (let i = 0; i < this.arRight.length; i++) {
            let item = this.items[this.arRight[i]];
            let wMiddleItem = this.getWitem(this.items[this.currentIndex]);
            const wItem = this.getWitem(item);
            let percent = (wItem * i + wMiddleItem) * 100 / this.totalWidth;
            item.style.position = "absolute";
            item.style.left = 0;
            item.style.transform = `translateX(${transformX + percent}%)`;
            transformX += 100;
        }
    }
    setTransformLeftSideItem() {
        let transformX = 100;
        for (let i = 0; i < this.arLeft.length; i++) {
            let item = this.items[this.arLeft[i]];
            let wMiddleItem = this.getWitem(this.items[this.currentIndex]);
            const wItem = this.getWitem(item);
            let percent = (wItem * i + wMiddleItem) * 100 / this.totalWidth;
            item.style.position = "absolute";
            item.style.left = 0;
            item.style.transform = `translateX(${-1 * (transformX + percent)}%)`;
            transformX += 100;
        }
    }
    activeItem() {
        let dots = this.paginationBlock.querySelectorAll(".carousel__dot");
        for (let j = 0; j < dots.length; j++) {
            let dot = dots[j];
            dot.classList.remove("active");
        }
        let item = this.items[this.currentIndex];
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].classList.remove("active");
        }
        dots[this.currentIndex].classList.add("active");
        item.classList.add("active");

        this.sliderAnimate();
    }
    sliderAnimate() {
        let indexOfArLeft = this.arLeft.indexOf(this.currentIndex);
        let indexOfArRight = this.arRight.indexOf(this.currentIndex);
        let wItem = this.getWitem(this.items[0]);
        if (indexOfArLeft !== -1) {
            let percent = (wItem * (indexOfArLeft + 1)) * 100 / this.totalWidth;
            this.slider.style.transform = `translateX(${(percent)}%)`;
            this.sliderAttrTransform = percent;
        }
        else if (indexOfArRight !== -1) {
            let percent = (wItem * (indexOfArRight + 1)) * 100 / this.totalWidth;
            this.slider.style.transform = `translateX(${-1 * (percent)}%)`;
            this.sliderAttrTransform = percent;
        }
        else if (indexOfArLeft === -1 && indexOfArRight === -1) {
            this.slider.style.transform = `translateX(${0}%)`;
            this.sliderAttrTransform = 0;
        }
        if (this.currentIndex >= Math.round(this.maxItemInView / 2) - 2) {
            setTimeout(() => {
                this.itemsRightSide();
                this.itemsLeftSide();

                this.setTransformMiddleItem();
                this.setTransformRightSideItem();
                this.setTransformLeftSideItem();
                this.slider.classList.add("-non-animate");
                this.slider.style.transform = `translateX(${0}%)`;
                const timeout = setTimeout(() => {
                    this.slider.classList.remove("-non-animate");
                    clearTimeout(timeout);
                }, 50);
            }, 350);
        }
    }
    addPaginationDots() {
        for (let i = 0; i < this.items.length; i++) {
            let dot = document.createElement("div");
            dot.classList.add("carousel__dot");
            dot.setAttribute("index-item", i);
            dot.addEventListener("click", () => {
                this.eventClickDot(i);
            })
            this.paginationBlock.appendChild(dot);
        }
    }
    events() {
        this.clickNextItem();
        this.clickPrevItem();
        this.eventTouchDrag();
    }
    eventTouchDrag() {
        if ("ontouchmove" in window) {
            this.viewport.addEventListener("touchstart", this.handleMouseDown.bind(this));
            this.viewport.addEventListener("touchmove", this.handleMouseMove.bind(this));
            this.viewport.addEventListener("touchend", this.handleMouseUp.bind(this));
        } else {
            this.viewport.addEventListener("mousedown", this.handleMouseDown.bind(this));
            this.viewport.addEventListener("mousemove", this.handleMouseMove.bind(this));
            this.viewport.addEventListener("mouseup", this.handleMouseUp.bind(this));
        }
    }
    handleMouseDown(e) {
        this.pointerDown = true;
        this.pointer.x = e.touches ? e.touches[0].clientX : e.clientX;
        this.slider.classList.add("-non-animate");
        this.slideMoving = this.sliderAttrTransform;
    }

    handleMouseMove(e) {
        if (!this.pointerDown) return;

        const x = e.touches ? e.touches[0].clientX : e.clientX;
        this.velocity = (x - this.pointer.x) * 0.05;
        this.slideMoving += this.velocity;
        this.slider.style.transform = `translateX(${this.slideMoving}%)`;
        if(Math.abs(x - this.pointer.x) > 2){
            this.goSlide = true;
        }
        else{
            this.goSlide = false;
        }
        this.pointer.x = x;
    }

    handleMouseUp() {
        this.pointerDown = false;
        this.slider.classList.remove("-non-animate");
        if(!this.goSlide) {
            this.slider.style.transform = `translateX(${this.sliderAttrTransform}%)`;
            return false
        }
        if(this.velocity > 0.03){
            this.prevItem();
        }
        else if(this.velocity < -0.03){
            this.nextItem();
        }
    }
    eventClickDot(indexItem) {
        this.selectItem(indexItem);
    }
    selectItem(index) {
        this.currentIndex = index;
        this.activeItem();

    }
    nextItem() {
        if (this.currentIndex + 1 > this.items.length - 1) {
            this.selectItem(0);
        }
        else {
            this.selectItem(this.currentIndex + 1);
        }
    }
    clickNextItem() {
        this.btnNext.addEventListener("click", () => {
            this.nextItem();
        })
    }
    prevItem() {
        if (this.currentIndex - 1 < 0) {
            this.selectItem(this.items.length - 1);
        }
        else {
            this.selectItem(this.currentIndex - 1);
        }
    }
    clickPrevItem() {
        this.btnPrev.addEventListener("click", () => {
            this.prevItem();
        })
    }
}

const carousel1 = new PureCarousel({
    idCarousel: "#carousel1",
    itemCarousel: ".carousel__item",
    slider: ".carousel__slider",
    viewport : ".carousel__viewport"
})