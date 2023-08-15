# LoRAdo

[![Discord](https://img.shields.io/discord/1091306623819059300?color=7289da&label=Discord&logo=discord&logoColor=fff&style=for-the-badge)](https://discord.com/invite/m3TBB9XEkb)

Prepare datasets for [Kohya_ss](https://github.com/bmaltais/kohya_ss/) (a UI for
https://github.com/kohya-ss/sd-scripts.)

> We plan to integrate training directly into this tool

<!-- toc -->

- [Intro](#intro)
- [Why?](#why)
- [Screenshots](#screenshots)
- [Features](#features)
- [Getting Started with LoRAdo](#getting-started-with-lorado)
- [Generation examples](#generation-examples)

<!-- tocstop -->

## Intro

Welcome to LoRAdo. This toolkit is designed to streamline the process of LoRAs image generation.
Suitable for both beginners and experienced developers, it simplifies dataset creation. Initially
designed with portraits in mind, LoRAdo is adaptable and works well for various subjects. Key
features include face detection and user-friendly cropping tools, ensuring a practical balance
between user experience and results.

With LoRAdo, creating datasets for image training is straightforward and efficient.

## Why?

We wanted to provide an easy way to train LoRAs for different use cases. During research, we decided
to build a few small helper functions to help us gather images and crop them as well as create
caption files. This UI offers an easy way to create LoRAs without overthinking it.


## Screenshots

<p align="center">
<img src="assets/ui.png" width="600" alt="user interface">
<br/>
The user interface
</p>

<p align="center">
<img src="assets/slideshow.png" width="600" alt="slideshow">
<br/>
View and  configure images
</p>

<p align="center">
<img src="assets/folder.png" width="300" alt="folders">
<br/>
The prepared folder
</p>

<p align="center">
<img src="assets/crop.png" width="600" alt="cropped images">
<br/>
The cropped images
</p>


## Features

-   Dataset creation
-   Captioning tools
-   SDXL resolution adjustment
-   Multiple image resolutions
-   [Kohya_ss (UI)](https://github.com/bmaltais/kohya_ss/) config creator
-   Regularisation image tools (WIP)

## Getting Started with LoRAdo

1. **Prerequisites:**

    - Ensure you have `node.js (v18+)` installed. If not, you can download it from
      [Node.js official site](https://nodejs.org/).

2. **Clone and Install Dependencies:**

    ```bash
    git clone https://github.com/failfa-st/LoRAdo.git
    cd LoRAdo
    npm install
    ```

3. **Running the App:**

    ```bash
    npm run build
    npm run start
    ```

    Your app should now be running on [http://localhost:3000](http://localhost:3000). Navigate to
    this URL in your browser to explore the LoRAdo UI.

4. **Using LoRAdo:**

    - **Step 1:** Upload your desired image or images.
    - **Step 2:** Utilize the in-built face detection for quick crops or adjust as per your
      requirements.
    - **Step 3:** With a single click, transform your images into a ready-to-use dataset for
      [Kohya_ss](https://github.com/bmaltais/kohya_ss/)!

5. **Feedback and Support:** Encountered an issue or have a suggestion? Join our
   [Discord community](https://discord.com/invite/m3TBB9XEkb) or open an issue on GitHub. We'd love
   to hear from you!

---

Example images via [@anamnesis33](https://unsplash.com/@anamnesis33)

| Image                                                                                                              | Link                                    |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| [<img src="public/images/anamnesis33/example (1).jpg" width="100">](<public/images/anamnesis33/example%20(1).jpg>) | https://unsplash.com/photos/mqcYKihgfAo |
| [<img src="public/images/anamnesis33/example (2).jpg" width="100">](<public/images/anamnesis33/example%20(2).jpg>) | https://unsplash.com/photos/06TuQM7RSP4 |
| [<img src="public/images/anamnesis33/example (3).jpg" width="100">](<public/images/anamnesis33/example%20(3).jpg>) | https://unsplash.com/photos/AUJhl146mBY |
| [<img src="public/images/anamnesis33/example (4).jpg" width="100">](<public/images/anamnesis33/example%20(4).jpg>) | https://unsplash.com/photos/8OWttYqN47I |

This tool provides an opinionated configuration and approach to training flexible LoRAs. We are
constantly researching to improve the default settings provided by this tool. Advanced (detailed)
configuration is planned for future releases.

## Generation examples

These examples were generated from a LoRA, trained on a dataset that was prepared with this tool/approach

[<img src="assets/generations/example-1.png" width="150">](assets/generations/example-1.png)
[<img src="assets/generations/example-2.png" width="150">](assets/generations/example-2.png)
[<img src="assets/generations/example-3.png" width="150">](assets/generations/example-3.png)
[<img src="assets/generations/example-4.png" width="150">](assets/generations/example-4.png)
[<img src="assets/generations/example-6.png" width="150">](assets/generations/example-6.png)
[<img src="assets/generations/example-7.png" width="150">](assets/generations/example-7.png)
[<img src="assets/generations/example-8.png" width="150">](assets/generations/example-8.png)
[<img src="assets/generations/example-9.png" width="150">](assets/generations/example-9.png)
[<img src="assets/generations/example-10.png" width="150">](assets/generations/example-10.png)
[<img src="assets/generations/example-11.png" width="150">](assets/generations/example-11.png)
