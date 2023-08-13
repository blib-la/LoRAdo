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
import { ImageData } from "@/types";
import { exampleImages } from "@/data/exampleImages";

export default function Home() {
  const [epochs, setEpochs] = useState(5);
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
      <Box
        component="form"
        sx={{ my: 2 }}
        onSubmit={(event) => {
          event.preventDefault();
          console.log(images);
        }}
      >
        <Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
          <Grid xs={1}>
            <Stack gap={2}>
              <Box>
                <FormControl>
                  <FormLabel>SDXL Checkpoint</FormLabel>
                  <Input placeholder="C:\path\to\your\sd_xl_base_1.0.safetensors" />
                  <FormHelperText>
                    Please enter the path to your checkpoint.
                  </FormHelperText>
                </FormControl>
              </Box>
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <FormControl>
                    <FormLabel>Subject Name</FormLabel>
                    <Input placeholder="ohwx" />
                    <FormHelperText>
                      Please enter the name of the subject you want to train.
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid xs={1}>
                  <FormControl>
                    <FormLabel>Class Name</FormLabel>
                    <Input placeholder="woman" />
                    <FormHelperText>
                      Please enter the name of the class you want to train.
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              <SyncedSliderInput
                value={epochs}
                name="epochs"
                onChange={setEpochs}
                min={1}
                max={30}
                label="Epochs"
                helperText="How long do you want to train?"
              />
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={<Switch sx={{ mr: 1 }} />}
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
                    startDecorator={<Switch sx={{ mr: 1 }} />}
                  >
                    Create samples
                  </Typography>
                  <FormHelperText sx={{ mt: 1 }}>
                    Do you want to create sample images during training?
                    (slower)
                  </FormHelperText>
                </Grid>
              </Grid>{" "}
              <Grid container spacing={2} columns={2}>
                <Grid xs={1}>
                  <Typography
                    component="label"
                    startDecorator={<Switch sx={{ mr: 1 }} />}
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
                    startDecorator={<Switch sx={{ mr: 1 }} />}
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
