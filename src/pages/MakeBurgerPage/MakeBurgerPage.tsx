// MakeBurger.tsx
import React, { useEffect, useState } from 'react';
import styles from './MakeBurgerPage.module.scss';
import Summary from '../../components/Summary';
import Ingredient from '../../components/Ingredient';
import ingredientsData from '../../data/BurgerIngredients.json';
import { animated, config, useSprings } from 'react-spring';

export const MakeBurgerPage = () => {
    interface Ingredient {
        name: string,
        kcal: number,
        oz: number,
        price: number,
        time: number,
        img: string,
        height: number,
        width: number,
        left: number,
        img_group?: string,
    }

    const finishIngredient = ingredientsData[1];
    const initialIngredient = ingredientsData[0];
    const [burger, setBurger] = useState<Ingredient[]>([initialIngredient]);
    const [time, setTime] = useState<number>(initialIngredient.time);
    const [weight, setWeight] = useState<number>(initialIngredient.oz);
    const [kcal, setKcal] = useState<number>(initialIngredient.kcal);
    const [price, setPrice] = useState<number>(initialIngredient.price);

    const [showImg, setShowImg] = useState<boolean>(false);
    const [bottomIngredient, setBottomIngredient] = useState<number[]>([0, initialIngredient.height]);
    const [isTopBunAdded, setIsTopBunAdded] = useState<boolean>(false);
    const [addBurgerInt, setAddBurgerInt] = useState<boolean>(false);


    const ingredientsDataFilter = ingredientsData.filter(
        (ingredient) => ingredient.name !== 'Bun-top' && ingredient.name !== 'Bun-bottom'
    );

    const updateStats = (ingredient: Ingredient, operation: 'add' | 'remove') => {
        setTime((prev) => operation === 'add' ? prev + ingredient.time : Math.max(initialIngredient.time, prev - ingredient.time));
        setWeight((prev) => operation === 'add' ? prev + ingredient.oz : Math.max(initialIngredient.oz, prev - ingredient.oz));
        setKcal((prev) => operation === 'add' ? prev + ingredient.kcal : Math.max(initialIngredient.kcal, prev - ingredient.kcal));
        setPrice((prev) => operation === 'add' ? prev + ingredient.price : Math.max(initialIngredient.price, prev - ingredient.price));
    };

    //Добавление ингредиента на бургер
    const addIngredient = (ingredient: Ingredient) => {
        setBurger((prevBurger) => [...prevBurger, ingredient]);
        updateStats(ingredient, 'add');
        setBottomIngredient((prev) => [...prev, prev[prev.length - 1] + ingredient.height]);
        setShowImg(true);

        setAddBurgerInt(true); 
    };

    //Удаление ингредиента на бургер
    const removeIngredient = (ingredient: Ingredient) => {
        setBurger((prevBurger) => {
            const index = prevBurger.findIndex((item) => item === ingredient);
            if (index !== -1) {
                const updatedBurger = [...prevBurger];
                updatedBurger.splice(index, 1);
                return updatedBurger;
            }
            return prevBurger;
        });

        updateStats(ingredient, 'remove');
    };


    //! Добавление верхней булки
    const addTopBun = () => {
        if (!isTopBunAdded) {
            setBurger((prevBurger) => [...prevBurger, finishIngredient]);
            setBottomIngredient((prev) => [...prev, prev[prev.length - 1] + finishIngredient.height]);
            setIsTopBunAdded(true);
   
        }
    };

    //! Удаление верхней булки
    const removeTopBun = () => {
        setBurger((prevBurger) => prevBurger.filter(item => item !== finishIngredient));

    };

    //! Эффект для обработки изменений в burger
    useEffect(() => {
        if (burger.length > 1) {
            const timeoutId = setTimeout(() => {
                if (!isTopBunAdded) {
                    addTopBun();
                    setIsTopBunAdded(true);
                }
            }, 3000);

            removeTopBun();
            setIsTopBunAdded(false);
            setAddBurgerInt(false); //!

            return () => {
                clearTimeout(timeoutId);
            };
        }

    }, [addBurgerInt]);




    // Применяем анимацию translateY для каждого ингредиента в burger
    const springs = useSprings(
        burger.length,
        burger.map(() => ({
            from: { translateY: -50 },
            to: { translateY: showImg ? 0 : -50 },
            config: config.stiff,
        }))
    );

    //Обновляем анимацию при изменении showImg
    useEffect(() => {
        setShowImg(true);
    }, [burger]);


    return (
        <main>
            <div className={`${styles.main_container} container`}>
                <h1 className={styles.main_header}>Make <br /> Your <br /> Burger </h1>
                <div className={styles.main_grid}>

                    <div className={styles.main_burger}>
                        <div className={styles.main_burger__scene}>
                            {springs.map((spring, index) => (
                                <animated.img
                                    key={`${burger[index].name}-${index}`}
                                    className={styles.main_burger__scene__element}
                                    src={burger[index].img_group || burger[index].img}
                                    alt={`${burger[index].name}`}
                                    style={{
                                        bottom: `${bottomIngredient[index]}%`,
                                        width: `${burger[index].width}%`,
                                        left: `${burger[index].left}%`,
                                        zIndex: index,
                                        ...spring,
                                    }}
                                />
                            ))}
                        </div>

                    </div>
                    <div className={styles.main_summary}>
                        <Summary
                            time={time}
                            weight={weight}
                            kcal={kcal}
                            price={price}
                        />
                    </div>
                </div>

                <div className={styles.main_ingredients}>
                    {ingredientsDataFilter.map((ingredient, index) => (
                        <Ingredient
                            key={`${ingredient.name}-${index}`}
                            name={ingredient.name}
                            imgSrc={ingredient.img}
                            onAddIngredient={() => addIngredient(ingredient)}
                            onDeleteIngredient={() => removeIngredient(ingredient)}
                            quantity={burger.filter((item) => item === ingredient).length}
                        />
                    ))}
                </div>
            </div>
        </main>
    )
}
