import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response-interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly axios: AxiosAdapter
  ) { }

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.axios.get<PokeResponse>(`https://pokeapi.co/api/v2/pokemon?limit=650`);

    // data.results.forEach(async ({ name, url }) => {
    //   const segments = url.split('/');
    //   const pokeId: number = +segments[segments.length - 2];

    //   const pokemon = await this.pokemonModel.create({ name, no: pokeId })
    // });

    // * Comienza forma de insercion de varios registros a la vez con promesas
    // const insertPromisesArray = [];
    // data.results.forEach(async ({ name, url }) => {
    //   const segments = url.split('/');
    //   const pokeId: number = +segments[segments.length - 2];

    //   insertPromisesArray.push(this.pokemonModel.create({ name, no: pokeId }));
    // });
    
    // await Promise.all( insertPromisesArray )


    // * Comienza forma de insercion de varios registros a la vez solo con mongo
    const pokemonToInsert: { name: string, no: number }[] = [];
    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const pokeId: number = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no: pokeId });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed executed';
  }
}
