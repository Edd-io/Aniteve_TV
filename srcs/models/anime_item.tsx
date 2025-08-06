import { ImageSourcePropType } from "react-native";

interface AnimeItemProps {
  id: number;
  title: string;
  image: ImageSourcePropType;
  category: string;
  year?: string;
  episodes?: string;
}

class AnimeItem {
  id: number;
  title: string;
  image: ImageSourcePropType;
  category: string;
  year?: string;
  episodes?: string;

  constructor(
	id: number,
	title: string,
	image: ImageSourcePropType,
	category: string,
	year?: string,
	episodes?: string
  ) {
	this.id = id;
	this.title = title;
	this.image = image;
	this.category = category;
	this.year = year;
	this.episodes = episodes;
  }

  constructorFromObject(obj: AnimeItemProps): AnimeItem {
	return new AnimeItem(
	  obj.id,
	  obj.title,
	  obj.image,
	  obj.category,
	  obj.year,
	  obj.episodes
	);
  }
}

export default AnimeItem;