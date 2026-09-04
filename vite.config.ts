import {defineConfig} from 'vite';
import contributions from './api/contributions.js';
import graph from './api/graph.js';
export default defineConfig({plugins:[{name:'local-api',configureServer(server){server.middlewares.use((req,res,next)=>{const route=req.url?.split('?')[0];if(route==='/api/contributions')void contributions(req,res);else if(route==='/graph')void graph(req,res);else next();});}}]});
