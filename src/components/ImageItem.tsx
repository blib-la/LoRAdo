import {
  IconButton,
  Typography,
  Card,
  CardContent,
  Box,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import { ImageData } from "@/types";
import { ChangeEventHandler } from "react";
import dynamic from "next/dynamic";

const FaceDetectionImage = dynamic(
  () => import("@/components/FaceDetectionImage"),
  {
    ssr: false,
  },
);
interface ImageItemProps {
  demo?: boolean;
  image: ImageData;
  onRemove?: () => void;
  onOpen?: () => void;
  onFace?: (hasFace: boolean) => void;
  onCaptionChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

export default function ImageItem({
  image,
  demo,
  onRemove,
  onOpen,
  onFace,
  onCaptionChange,
}: ImageItemProps) {
  const hasGoodSize = Math.min(image.width, image.height) >= 1536;
  console.log();
  return (
    <Card
      variant="soft"
      color={hasGoodSize && image.hasFace ? "neutral" : "danger"}
      sx={{
        breakInside: "avoid",
        opacity: demo ? 0.25 : undefined,
        pointerEvents: demo ? "none" : undefined,
        userSelect: demo ? "none" : undefined,
      }}
    >
      <div>
        <Typography level="title-md">{image.name}</Typography>

        {!demo && (
          <IconButton
            aria-label="Remove"
            size="sm"
            sx={{ position: "absolute", top: "0.875rem", right: "0.5rem" }}
            onClick={onRemove}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </div>
      <CardContent>
        <div>
          <Typography level="body-xs">Size: {image.size} bytes </Typography>
          <Typography level="body-xs">
            Dimensions: {image.width}x{image.height}
          </Typography>
        </div>
      </CardContent>
      <Box
        component={demo ? "div" : "button"}
        type={demo ? undefined : "button"}
        sx={{
          mx: -2,
          p: 0,
          bgcolor: "none",
          border: 0,
          display: "flex",
          cursor: demo ? "default" : "pointer",
        }}
        onClick={onOpen}
      >
        <FaceDetectionImage
          src={image.data}
          alt={image.name}
          width={image.width}
          height={image.height}
          style={{
            width: "100%",
            height: "auto",
          }}
          onFace={onFace}
        />
      </Box>
      <FormControl>
        <FormLabel>Caption</FormLabel>
        <Textarea
          readOnly={demo}
          value={image.caption}
          onChange={onCaptionChange}
        />
        <FormHelperText>Describe the subject in the image</FormHelperText>
      </FormControl>
    </Card>
  );
}
