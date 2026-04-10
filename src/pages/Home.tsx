import { useState, useEffect } from "react";
import { z } from "zod";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
    title: z.string().min(2, "Tytuł jest za krótki") .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ]/, "Tytuł musi zaczynać się wielką literą"),
    description: z.string().min(5, "Opis jest za krótki"),
    image: z.string().url("To nie jest poprawny URL") .refine((url) => url.includes("https"), "URL musi używać https"),
    rating: z.number().min(1).max(5),
});


export default function Home() {

    const form = useForm({
        resolver: zodResolver(recipeSchema),
            defaultValues: {
            title: "",
            description: "",
            image: "",
            rating: 0,
            },
     });

    const [recipes, setRecipes] = useState([]);
    type SelectedRecipeMode = "add" | "edit" | "view";

    type SelectedRecipe = {
    id?: number;
    title?: string;
    description?: string;
    image?: string;
    rating?: number;
    mode: SelectedRecipeMode;
    } | null;

    const [selectedRecipe, setSelectedRecipe] = useState<SelectedRecipe>(null);

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
            rating: 4,
        },
        {
            id: 2,
            title: "Sałatka Cezar",
            description: "Klasyczna sałatka z kurczakiem.",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
            favorite: false,
            rating: 4,
        },
        {
            id: 3,
            title: "Szarlotka",
            description: "Domowe ciasto z jabłkami.",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
            favorite: false,
            rating: 4,
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
        <TooltipProvider>
    <>
      <div className="container mx-auto p-6 flex justify-between items-center">
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
                        className="group cursor-pointer hover:shadow-lg transition relative container-type-inline-size"
                        onClick={() => setSelectedRecipe(recipe)}
                        >
                        <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>

                            <TooltipContent>
                                <p>{recipe.favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}</p>
                            </TooltipContent>
                        </Tooltip>


                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            loading="lazy"
                            className="w-full h-40 object-cover"
                        />

                        <CardHeader>
                            <CardTitle className="group-hover:text-blue-600 transition @container">
                                <span className="text-lg @lg:text-2xl">
                                    {recipe.title}
                                </span>
                            </CardTitle>

                        </CardHeader>

                        <CardContent>
                            <p>{recipe.description}</p>
                        </CardContent>

                        <CardContent>
                            <p>Rating: {recipe.rating}</p>
                        </CardContent>

                        <div className="px-6 pb-4 flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:underline cursor-pointer"
                                >
                                Opcje
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white"
                                >
                                <DropdownMenuItem
                                    onClick={() => {
                                    form.reset(recipe);
                                    setSelectedRecipe({ ...recipe, mode: "edit" });
                                    }}
                                >
                                    Edytuj
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => {
                                    setRecipes(recipes.filter((r) => r.id !== recipe.id));
                                    setSelectedRecipe(null);
                                    }}
                                    className="text-red-600"
                                >
                                    Usuń
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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

                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem className="">
                            <FormLabel className="">Ocena</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                {[1,2,3,4,5].map((n) => (
                                    <button
                                    type="button"
                                    key={n}
                                    onClick={() => field.onChange(n)}
                                    className={`p-2 rounded-full border 
                                        ${field.value === n ? "bg-black text-white" : "bg-white"}`}
                                    >
                                    {n}
                                    </button>
                                ))}
                                </div>
                            </FormControl>
                            {/* <FormMessage error={error}/> */}
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
    </TooltipProvider>
  );
}
