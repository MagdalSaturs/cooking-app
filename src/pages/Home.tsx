import { useState, useEffect } from "react";
import { z } from "zod";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";


const recipeSchema = z.object({
    title: z.string().min(2, "Tytuł jest za krótki"),
    description: z.string().min(5, "Opis jest za krótki"),
    image: z.string().url("To nie jest poprawny URL"),
});


export default function Home() {

    const form = useForm({
        resolver: zodResolver(recipeSchema),
            defaultValues: {
            title: "",
            description: "",
            image: "",
            },
     });

    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [search, setSearch] = useState("");
    const [showFavorites, setShowFavorites] = useState(false);


    const setFavoriteById = (id) => {
        setRecipes(
            recipes.map((recipe) =>
            recipe.id === id
                ? { ...recipe, favorite: !recipe.favorite }
                : recipe
            )
        );
    };


    useEffect(() => {
    const saved = localStorage.getItem("recipes");

    if (saved === null) {
        setRecipes([
        {
            id: 1,
            title: "Spaghetti Carbonara",
            description: "Pyszny makaron z sosem jajecznym.",
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
            favorite: false,
        },
        {
            id: 2,
            title: "Sałatka Cezar",
            description: "Klasyczna sałatka z kurczakiem.",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
            favorite: false,
        },
        {
            id: 3,
            title: "Szarlotka",
            description: "Domowe ciasto z jabłkami.",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
            favorite: false,
        },
        ]);
    } else {
        setRecipes(JSON.parse(saved));
    }
    }, []);

    useEffect(() => {
        if (recipes && recipes.length > 0) {
            localStorage.setItem("recipes", JSON.stringify(recipes));
        }
    }, [recipes]);


    const onSubmit = (values) => {
        if (selectedRecipe?.mode === "edit") {
            setRecipes(
                recipes.map((r) =>
                r.id === selectedRecipe.id
                    ? { ...r, ...values }
                    : r
                )
            );
            setSelectedRecipe(null);
            return;
        }

        setRecipes([
            ...recipes,
            { id: Date.now(), favorite: false, ...values }
        ]);
        setSelectedRecipe(null);
    };


    return (
    <>
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Przepisy</h1>

        <Button
            onClick={() => {
                form.reset({
                title: "",
                description: "",
                image: "",
                });
                setSelectedRecipe({ mode: "add" });
            }}
            >
            Dodaj przepis
        </Button>


        <Button
            variant={showFavorites ? "secondary" : "outline"}
            onClick={() => setShowFavorites(!showFavorites)}
            >
            {showFavorites ? "Pokaż wszystkie" : "Pokaż ulubione"}
        </Button>

        </div>


        <div className="p-6">
            <input
                type="text"
                placeholder="Szukaj przepisu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 border rounded-lg mb-6"
            />
        </div>


        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes &&
                recipes
                    .filter((recipe) =>
                    recipe.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .filter((recipe) => (showFavorites ? recipe.favorite : true))
                    .map((recipe) => (
                    <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 12,
                        }}
                    >
                        <Card
                        className="cursor-pointer hover:shadow-lg transition relative"
                        onClick={() => setSelectedRecipe(recipe)}
                        >
                        <div
                            className="absolute top-3 right-3"
                            onClick={(e) => {
                            e.stopPropagation();
                            setFavoriteById(recipe.id);
                            }}
                        >
                            <motion.div
                            whileTap={{ scale: 1.3, y: -4 }}
                            animate={recipe.favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, duration: 0.3 }}
                            >
                            {recipe.favorite ? (
                                <Heart size={24} className="text-red-500 drop-shadow" fill="red" />
                            ) : (
                                <Heart size={24} className="text-white drop-shadow" />
                            )}
                            </motion.div>
                        </div>

                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            loading="lazy"
                            className="w-full h-40 object-cover"
                        />

                        <CardHeader>
                            <CardTitle>{recipe.title}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p>{recipe.description}</p>
                        </CardContent>

                        <div className="flex justify-end gap-2 px-6 pb-4">
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                form.reset(recipe);
                                setSelectedRecipe({ ...recipe, mode: "edit" });
                            }}
                            className="text-blue-600 hover:underline"
                            >
                            Edytuj
                            </button>

                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setRecipes(recipes.filter((r) => r.id !== recipe.id));
                                setSelectedRecipe(null);
                            }}
                            className="text-red-600 hover:underline"
                            >
                            Usuń
                            </button>
                        </div>
                        </Card>
                    </motion.div>
            ))}
        </div>


        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
            <DialogContent className="bg-white text-black">
            <DialogHeader>
                <DialogTitle>
                {selectedRecipe?.mode === "edit"
                    ? "Edytuj przepis"
                    : selectedRecipe?.id
                    ? "Szczegóły przepisu"
                    : "Dodaj nowy przepis"}
                </DialogTitle>
            </DialogHeader>


            {selectedRecipe?.id && selectedRecipe?.mode !== "add" && selectedRecipe?.mode !== "edit" ? (
                <>
                <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-60 object-cover rounded-lg mb-4"
                />
                    <p>{selectedRecipe.description}</p>
                </>
            ) : (

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field, error }) => (
                            <FormItem className="">
                            <FormLabel className="">Tytuł przepisu</FormLabel>
                            <FormControl>
                                <Input placeholder="Tytuł przepisu" {...field} />
                            </FormControl>
                            <FormMessage error={error} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field, error }) => (
                            <FormItem className="">
                            <FormLabel className="">Opis przepisu</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Opis przepisu" {...field} />
                            </FormControl>
                            <FormMessage error={error} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field, error }) => (
                            <FormItem className="">
                            <FormLabel className="">URL zdjęcia</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage error={error} />
                            </FormItem>
                        )}
                    />

                    <button
                        type="submit"
                        className="bg-black text-white p-3 rounded-lg"
                    >
                        Zapisz
                    </button>
                </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
