import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import { DragEvent, useState } from "react";
import SlideshowModal from "@/components/SlideshowModal";
import SyncedSliderInput from "@/components/SynchedSliderInput";
import ImageItem from "@/components/ImageItem";
import FileUpload from "@/components/FileUpload";
import Masonry from "@/components/Masonry";
import { nanoid } from "nanoid";
import Layout from "@/components/Layout";
import { traverseFileTree } from "@/utils/traverseFileTree";
import { FormDataModel, ImageData } from "@/types";
import { exampleImages } from "@/data/exampleImages";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";

export default function Home() {
  const {
    formState: { errors },
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm({
    defaultValues: {
      filename: "",
      checkpoint: "",
      subject: "",
      className: "",
      epochs: 5,
      crop: false,
      sample: false,
      lowVRAM: false,
      regularisation: false,
      files: [],
    },
  });
  const [images, setImages] = useState<Array<ImageData>>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null,
  );

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setCurrentImageIndex(null);
    setModalOpen(false);
  };
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === null) {
        return 0; // Initialize to the first image if currently null
      }
      // If we're at the last index, go back to the first one (0).
      return prevIndex >= images.length - 1 ? 0 : prevIndex + 1;
    });
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === null) {
        return images.length - 1; // Initialize to the last image if currently null
      }
      // If we're at the first index, go to the last one.
      return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
    });
  };
  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    const items = event.dataTransfer.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();

      if (item) {
        await traverseFileTree(item, (imageData: ImageData) => {
          setImages((prev) => [...prev, { ...imageData, id: nanoid() }]);
        });
      }
    }
  };
  const handleRemove = (imageIndex: number) => {
    setImages((prevImages) => {
      return prevImages.filter((_, index) => index !== imageIndex);
    });
    if (imageIndex === currentImageIndex) {
      prevImage();
    }
  };

  const handleCaptionChange = (value: string, imageIndex: number) => {
    setImages((prevImages) => {
      return prevImages.map((image, index) =>
        index === imageIndex ? { ...image, caption: value } : image,
      );
    });
  };
  const handleFace = (hasFace: boolean, imageIndex: number) => {
    setImages((prevImages) => {
      return prevImages.map((image, index) =>
        index === imageIndex ? { ...image, hasFace } : image,
      );
    });
  };

  const onSubmit = async (data: Omit<FormDataModel, "files">) => {
    const formData = new FormData();
    formData.append("checkpoint", data.checkpoint);
    formData.append("subject", data.subject);
    formData.append("className", data.className);
    formData.append("filename", data.filename);
    formData.append("epochs", data.epochs.toString());
    formData.append("crop", data.crop.toString());
    formData.append("sample", data.sample.toString());
    formData.append("lowVRAM", data.lowVRAM.toString());
    formData.append("regularisation", data.regularisation.toString());

    images.forEach((image, index) => {
      const byteCharacters = atob(image.data.split(",")[1]);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: "image/jpeg" }); // Assuming the image is JPEG. Adjust accordingly
      formData.append(`files_${index}`, blob, image.name);
      formData.append(`caption_${index}`, image.caption); // Append the caption for the image
    });
    try {
      const response = await axios.post("/api/prepare", formData);
      console.log(response.data);
    } catch (error) {
      console.error("Error sending data: ", error);
    }
  };
  return (
    <Layout>
      <SlideshowModal
        images={images}
        currentIndex={currentImageIndex !== null ? currentImageIndex : 0}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNext={nextImage}
        onPrev={prevImage}
        onDelete={handleRemove}
      />
      <Box component="form" sx={{ my: 2 }} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
          <Grid xs={1}>
            <Stack gap={2}>
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <FormControl color={errors.checkpoint ? "danger" : "neutral"}>
                    <FormLabel>SDXL Checkpoint</FormLabel>
                    <Input
                      error={Boolean(errors.checkpoint)}
                      placeholder="C:\path\to\your\sd_xl_base_1.0.safetensors"
                      {...register("checkpoint", { required: true })}
                    />
                    <FormHelperText>
                      Please enter the path to your checkpoint.
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid xs={1}>
                  <FormControl color={errors.filename ? "danger" : "neutral"}>
                    <FormLabel>LoRA Name</FormLabel>
                    <Input
                      error={Boolean(errors.filename)}
                      placeholder="ohwxwoman"
                      {...register("filename", { required: true })}
                    />
                    <FormHelperText>
                      Please enter the filename of the LoRA.
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <FormControl color={errors.subject ? "danger" : "neutral"}>
                    <FormLabel>Subject Name</FormLabel>
                    <Input
                      error={Boolean(errors.subject)}
                      placeholder="ohwx"
                      {...register("subject", { required: true })}
                    />
                    <FormHelperText>
                      Please enter the name of the subject you want to train.
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid xs={1}>
                  <FormControl color={errors.className ? "danger" : "neutral"}>
                    <FormLabel>Class Name</FormLabel>
                    <Input
                      error={Boolean(errors.className)}
                      placeholder="woman"
                      {...register("className", { required: true })}
                    />
                    <FormHelperText>
                      Please enter the name of the class you want to train.
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              <Controller
                name="epochs"
                control={control}
                defaultValue={5}
                render={({ field }) => (
                  <SyncedSliderInput
                    {...field}
                    min={1}
                    max={30}
                    label="Epochs"
                    helperText="How long do you want to train?"
                    onChange={(value) => {
                      setValue("epochs", value);
                      field.onChange(value);
                    }}
                  />
                )}
              />
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={
                      <Controller
                        name="crop"
                        control={control}
                        render={({ field }) => (
                          <Switch sx={{ ml: 1 }} {...field} />
                        )}
                      />
                    }
                  >
                    Create crops
                  </Typography>
                  <FormHelperText sx={{ mt: 1 }}>
                    Do you want to create SDXL resolution crop versions of you
                    images?
                  </FormHelperText>
                </Grid>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={
                      <Controller
                        name="sample"
                        control={control}
                        render={({ field }) => (
                          <Switch sx={{ ml: 1 }} {...field} />
                        )}
                      />
                    }
                  >
                    Create samples
                  </Typography>
                  <FormHelperText sx={{ mt: 1 }}>
                    Do you want to create sample images during training?
                    (slower)
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={
                      <Controller
                        name="lowVRAM"
                        control={control}
                        render={({ field }) => (
                          <Switch sx={{ ml: 1 }} {...field} />
                        )}
                      />
                    }
                  >
                    Low VRAM
                  </Typography>
                  <FormHelperText sx={{ mt: 1 }}>
                    Optimize for low VRAM (below 16GB)? (less accurate)
                  </FormHelperText>
                </Grid>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={
                      <Controller
                        name="regularisation"
                        control={control}
                        render={({ field }) => (
                          <Switch sx={{ ml: 1 }} {...field} />
                        )}
                      />
                    }
                  >
                    Regularisation
                  </Typography>
                  <FormHelperText sx={{ mt: 1 }}>
                    Do you want to use regularisation images during training?
                    (more flexible but twice as slow)
                  </FormHelperText>
                </Grid>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Button fullWidth type="submit" disabled={images.length === 0}>
                  Prepare
                </Button>
              </Box>
              <Alert
                variant="soft"
                color={
                  images.length >= 10
                    ? "success"
                    : images.length >= 5
                    ? "warning"
                    : "danger"
                }
                size="sm"
                endDecorator={
                  <Button
                    size="sm"
                    variant="solid"
                    disabled={images.length === 0}
                    color={
                      images.length >= 10
                        ? "success"
                        : images.length >= 5
                        ? "warning"
                        : "danger"
                    }
                    onClick={() => {
                      setImages([]);
                    }}
                  >
                    Remove all images
                  </Button>
                }
              >
                Using {images.length} image{images.length === 1 ? "" : "s"}.
                {images.length < 5 && images.length > 0 && (
                  <Typography level="body-xs">
                    Less images mean less versatility.
                  </Typography>
                )}
                {images.length === 0 && (
                  <Typography level="body-xs">Please add images.</Typography>
                )}
              </Alert>
            </Stack>
          </Grid>
          <Grid xs={1} sx={{ display: "flex" }}>
            <FileUpload
              onDrop={handleDrop}
              onLoad={(imageData) => {
                setImages((prev) => [
                  ...prev,
                  { ...imageData, id: nanoid(), caption: "" },
                ]);
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Masonry columns={4}>
        {images.map((image, index) => (
          <ImageItem
            key={image.id}
            image={image}
            onFace={(hasFace) => {
              handleFace(hasFace, index);
            }}
            onRemove={() => {
              handleRemove(index);
            }}
            onOpen={() => {
              openModal(index);
            }}
            onCaptionChange={(event) => {
              handleCaptionChange(event.target.value, index);
            }}
          />
        ))}
        {images.length === 0 &&
          exampleImages.map((image, index) => (
            <ImageItem
              key={image.id}
              demo
              image={{
                caption: image.caption,
                id: image.id,
                data: image.src,
                width: image.width,
                height: image.height,
                name: image.name,
                size: image.size,
              }}
            />
          ))}
      </Masonry>
    </Layout>
  );
}
