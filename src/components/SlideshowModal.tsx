import {
  Box,
  Modal,
  ModalClose,
  Sheet,
  IconButton,
  Typography,
  Button,
} from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Image from "next/image";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
interface SlideshowModalProps {
  images: Array<{
    data: string;
    name: string;
    size: number;
    width: number;
    height: number;
  }>;
  currentIndex: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (index: number) => void;
}

export default function SlideshowModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
  onDelete,
}: SlideshowModalProps) {
  const currentImage = images[currentIndex || 0];
  const [confirm, setConfirm] = useState(false);

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isOpen}
      onClose={onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "85vw",
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
        }}
      >
        <ModalClose variant="outlined" onClick={onClose} />

        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          textColor="inherit"
          fontWeight="lg"
          mb={1}
        >
          {`Image ${currentIndex !== null ? currentIndex + 1 : 0} of ${
            images.length
          }`}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => {
              onPrev();
              setConfirm(false);
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          {currentImage && (
            <Box component="figure" sx={{ textAlign: "center", width: "100%" }}>
              <Image
                src={currentImage.data}
                alt={`Image ${currentIndex}`}
                width={currentImage.width}
                height={currentImage.height}
                style={{
                  width: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
              <Typography level="body-sm" component="figcaption" sx={{ mb: 4 }}>
                {currentImage.name} - Size: {currentImage.size} bytes |
                Dimensions: {currentImage.width}x{currentImage.height}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {confirm ? (
                  <>
                    <Button
                      startDecorator={<CancelIcon />}
                      onClick={() => {
                        setConfirm(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      startDecorator={<DeleteForeverIcon />}
                      onClick={() => {
                        setConfirm(false);
                        if (currentIndex !== null) {
                          onDelete(currentIndex);
                        }
                      }}
                    >
                      Confirm
                    </Button>
                  </>
                ) : (
                  <Button
                    startDecorator={<DeleteIcon />}
                    onClick={() => {
                      setConfirm(true);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          )}
          <IconButton
            onClick={() => {
              onNext();
              setConfirm(false);
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Sheet>
    </Modal>
  );
}
