export async function traverseFileTree(item: any, onLoad: any, path = "") {
  if (item.isFile) {
    item.file((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target!.result as string;
        img.onload = () => {
          onLoad({
            data: event.target!.result as string,
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
          });
        };
      };
      reader.readAsDataURL(file);
    });
  } else if (item.isDirectory) {
    const dirReader = item.createReader();
    dirReader.readEntries(async (entries: any) => {
      for (let i = 0; i < entries.length; i++) {
        await traverseFileTree(entries[i], onLoad, path + item.name + "/");
      }
    });
  }
}
